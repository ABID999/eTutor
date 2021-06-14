const stripe = require('stripe')('sk_test_51IPRcBCDcOy31yBpbHRHHgA7JeiQBEptRfXaryxoeim9JayvDfMD4rMiXNdmNvE4fpchhInJAxkytgN2VjEqFu7r00ikHY9Wv9');
const Class = require('../models/Class')

const PORT = process.env.PORT || 8080

const MY_DOMAIN = 'http://localhost:'+ PORT 

const stripeController = async (req, res) => {
    let classId = req.body.classId
    let selectedClass = await Class.findOne({_id: classId})
    console.log(parseFloat(selectedClass.fee.toString()))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'bdt',
            product_data: {
              name: selectedClass.title
            },
            unit_amount: parseInt(selectedClass.fee.toString())*100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${MY_DOMAIN}/student/payment/success/${selectedClass._id}`,
      cancel_url: `${MY_DOMAIN}/student/payment/cancel/${selectedClass._id}`,
    });
  
    res.json({ id: session.id });
};

module.exports = stripeController
