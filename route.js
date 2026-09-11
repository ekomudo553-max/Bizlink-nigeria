import {createSupabaseServerClient} from "../../../lib/supabase/server";

export async function POST(request){
 try{
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return Response.json({error:"Sign in to review."},{status:401});
  const body=await request.json();
  const rating=Number(body.rating);
  if(!body.business_id||rating<1||rating>5||!body.comment)return Response.json({error:"Valid review data is required."},{status:400});
  const {data,error}=await supabase.from("reviews").insert({business_id:body.business_id,user_id:user.id,rating,comment:body.comment}).select().single();
  if(error)return Response.json({error:error.message},{status:400});
  return Response.json({review:data},{status:201});
 }catch(e){return Response.json({error:e.message},{status:500});}
}
