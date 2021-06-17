const stripe = require('stripe')('sk_test_51IPRcBCDcOy31yBpbHRHHgA7JeiQBEptRfXaryxoeim9JayvDfMD4rMiXNdmNvE4fpchhInJAxkytgN2VjEqFu7r00ikHY9Wv9');
const Class = require('../models/Class')
const Course = require('../models/Course')

const PORT = process.env.PORT || 8080

const MY_DOMAIN = 'http://localhost:'+ PORT 

const stripeController = async (req, res) => {
  try{
    let classId = req.body.classId
    let selectedClass = await Class.findOne({_id: classId})
    if(!selectedClass){
      selectedClass = await Course.findOne({_id: classId})
    }
    if(!selectedClass){
      return res.render('student/classes', {classes: {},alert: {message: 'Class/Course was not found on database'}})
    }

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
  }catch(e){
    console.log(e)
    next();
  }
};

module.exports = stripeController
