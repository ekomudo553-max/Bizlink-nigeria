 "use client";

import {useState} from "react";

export default function ReviewForm({businessId}){
  const [rating,setRating]=useState(5),[comment,setComment]=useState(""),[message,setMessage]=useState("");
  async function submit(e){
    e.preventDefault(); setMessage("");
    const res=await fetch("/api/reviews",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({business_id:businessId,rating:Number(rating),comment})});
    const data=await res.json();
    setMessage(res.ok?"Review submitted.":data.error||"Unable to submit review.");
    if(res.ok){setComment("");}
  }
  return <form className="form" onSubmit={submit}>
    <h3>Leave a review</h3>
    <select value={rating} onChange={e=>setRating(e.target.value)}>
      {[5,4,3,2,1].map(x=><option key={x} value={x}>{x}/5</option>)}
    </select>
    <textarea rows="4" placeholder="Your experience" value={comment} onChange={e=>setComment(e.target.value)} required/>
    <button className="btn">Submit review</button>
    {message && <div className="notice">{message}</div>}
  </form>;
}
