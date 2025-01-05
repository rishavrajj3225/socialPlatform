import mongoose from "mongoose"
 // isko agar lagana hai to hum user wale hi hum ek array bna kr rakh lete but ye operation bahut expensive hota kyunki millinons of subscriber ho skte hai to bahut jyada costly ho jayega
const subscriptionSchema = new mongoose.Schema({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId, // one who is subscribing
    ref: "User",
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId, // one to whom is subscriber is subscribing
    ref: "User",
  },
},{
    timestamps:true
});

export const Subscription =mongoose.model("Subscription",subscriptionSchema)