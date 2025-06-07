// src/utils/supabaseUtils.js
import { supabase } from "../../lib/supabaseClient";

export const fetchBrandStoryData = async (authUserId) => {
  const { data: BrandStoryData, error: BrandStoryError } = await supabase
    .from("brand_story_forms")
    .select("*")
    .eq("user_id", authUserId)
    .single();

  if (BrandStoryError) {
    console.error("Brand fetch error:", BrandStoryError);
    return null;
  }

  const updatedData = {
    brand_name: BrandStoryData.brand_name || '',
    character: BrandStoryData.character || '',
    external_problem: BrandStoryData.external_problem || '',
    internal_problem: BrandStoryData.internal_problem || '',
    philosophical_problem: BrandStoryData.philosophical_problem || '',
    villain: BrandStoryData.villain || '',
    positive_outcomes: BrandStoryData.positive_outcomes || '',
    plan: BrandStoryData.plan || '',
    empathy: BrandStoryData.empathy || '',
    authority: BrandStoryData.authority || '',
    avoid_failure: BrandStoryData.avoid_failure || ''
  };



  return updatedData;
};
export const fetchWebsiteIntakeData = async (authUserId) => {
  const { data: websiteIntakeData, error: websiteIntakeError } = await supabase
    .from("web_design_intake")
    .select("*")
    .eq("user_id", authUserId)
    .single();

  if (websiteIntakeError) {
    console.error("websiteIntake fetch error:", websiteIntakeError);
    return null;
  }

  const updatedData = {
    selected_template: websiteIntakeData.selected_template || '',
    logo_url: websiteIntakeData.logo_url || '',
    wants_logo_help: websiteIntakeData.wants_logo_help ||'',
    inspiration_link: websiteIntakeData.inspiration_link ||'',
    notes: websiteIntakeData.notes||'',
  };



  return updatedData;
};
export const fetchDeploySite = async (brandData,webDesignIntake, userId) => {
  await fetch("http://3.144.46.178:3000/api/deploy-site", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brandData,
      webDesignIntake,
      userId, // if you're using it
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("✅ Success:", data);
    })
    .catch((err) => {
      console.error("❌ Error sending data to API:", err);
    });

};
