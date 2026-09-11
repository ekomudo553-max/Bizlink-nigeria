"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadBusinesses() {
    setLoading(true);

    const { data, error } = await supabase
      .from("businesses")
      .select(`
        id,
        business_name,
        description,
        phone,
        image_url,
        status,
        category:categories(
          category_name
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error) {
      setBusinesses(data || []);
    }

    setLoading(false);
  }


  async function updateStatus(id, status) {

    const { error } = await supabase
      .from("businesses")
      .update({ status })
      .eq("id", id);


    if (!error) {
      loadBusinesses();
    }
  }


  useEffect(() => {
    loadBusinesses();
  }, []);


  if (loading) {
    return (
      <div className="p-10">
        Loading businesses...
      </div>
    );
  }


  return (
    <main className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        BizLink Admin Dashboard
      </h1>


      {businesses.length === 0 && (
        <p>
          No pending businesses.
        </p>
      )}


      <div className="grid gap-5">

        {businesses.map((business)=>(
          <div
            key={business.id}
            className="border rounded-xl p-5 shadow"
          >

            <h2 className="text-xl font-bold">
              {business.business_name}
            </h2>


            <p>
              Category:
              {" "}
              {business.category?.category_name || "None"}
            </p>


            <p>
              {business.description}
            </p>


            <p>
              Phone:
              {" "}
              {business.phone}
            </p>


            <div className="flex gap-3 mt-4">

              <button
                onClick={() =>
                  updateStatus(
                    business.id,
                    "approved"
                  )
                }
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Approve
              </button>


              <button
                onClick={() =>
                  updateStatus(
                    business.id,
                    "rejected"
                  )
                }
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject
              </button>

            </div>

          </div>
        ))}

      </div>

    </main>
  );
        }
