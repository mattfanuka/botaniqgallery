import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end("Method Not Allowed");
    }

    try {
        const { cart } = req.body;
        
        //Sanity validation
        const query = `{
            "watercolors": *[_type == "watercolorPainting" && _id in ${JSON.stringify(
                cart.map(i => i._id)
            )}] {
                _id,
                name,
                dimensions,
                price,
                "type": "watercolor"
            },
            "prints": *[_type == "digitalPrint" && _id in ${JSON.stringify(
                cart.map(i => i._id)
            )}] {
                _id,
                name,
                sizes[] {
                    width, height, price
                },
                "type":"print"
            }
        }`;

        const sanityUrl = `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v2025-08-19/data/query/production?query=${encodeURIComponent(query)}`;
        
        const sanityRes = await fetch(sanityUrl);
        const sanityData = await sanityRes.json();

        const productsData = sanityData.result;

        const lineItems = cart.map(item => {

            if(item.type === 'watercolor'){
                const product = productsData.watercolors.find(i => i._id === item._id);
                if (!product) throw new Error (`Watercolor not found: ${item._id}`);

                return {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: product.name },
                        unit_amount: Math.round(product.price * 100), //cents
                    },
                    quantity: 1,
                }
            }
            else if (item.type === 'print'){
                const product = productsData.prints.find(i => i._id === item._id);
                if (!product) throw new Error (`Print not found: ${item._id}`);

                const size = `${item.selectedSize.width}x${item.selectedSize.height}`
                const price = item.selectedSize.price;

                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${product.name} (${size})`,
                        },
                        unit_amount: Math.round(price * 100), //cents
                    },
                    quantity: item.quantity,
                };
            };
        });

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `${process.env.SITE_URL}/success.html`,
            cancel_url: `${process.env.SITE_URL}/cart.html`,
        });

    res.status(200).json({ url: session.url });
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong creating checkout' });
  }
};