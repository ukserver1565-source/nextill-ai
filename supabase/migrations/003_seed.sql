-- 003_seed.sql
-- Seed data for Nextill AI

-- ============================================================
-- PLANS
-- ============================================================
insert into public.plans (id, name, slug, price_monthly, price_yearly, credits, features, is_active) values
('plan_free', 'Free', 'free', 0, 0, 100, '["AI Writer (5/day)", "Basic tools", "1 project"]', true),
('plan_starter', 'Starter', 'starter', 29, 290, 2000, '["AI Writer (50/day)", "AI Humanizer", "AI Detector", "Plagiarism Checker", "SEO Title Generator", "Meta Description Generator", "3 projects"]', true),
('plan_pro', 'Pro', 'pro', 79, 790, 5000, '["All Starter features", "Keyword Research", "Website Audit", "10 projects", "Priority support"]', true),
('plan_agency', 'Agency', 'agency', 149, 1490, 15000, '["All Pro features", "Rank Tracker", "Backlink Checker", "50 projects", "Team (10 users)", "API access"]', true),
('plan_enterprise', 'Enterprise', 'enterprise', 299, 2990, 50000, '["All Agency features", "Unlimited projects", "Unlimited users", "Custom AI models", "Dedicated support", "SLA"]', true)
on conflict (slug) do nothing;

-- ============================================================
-- TOOL SETTINGS
-- ============================================================
insert into public.tool_settings (id, tool_slug, tool_name, is_enabled, guest_daily_limit, free_daily_limit, premium_daily_limit, credits_cost, default_model, prompt_template) values
('tool_ai_writer', 'ai-writer', 'AI Writer', true, 1, 5, 100, 10, 'gpt-4o', 'Write a comprehensive article about {topic}'),
('tool_ai_humanizer', 'ai-humanizer', 'AI Humanizer', true, 1, 3, 50, 5, 'gpt-4o', 'Humanize this text: {text}'),
('tool_ai_detector', 'ai-detector', 'AI Detector', true, 1, 5, 100, 3, 'custom-detector', 'Analyze if this text is AI-generated: {text}'),
('tool_plagiarism_checker', 'plagiarism-checker', 'Plagiarism Checker', true, 1, 2, 30, 8, 'custom-plagiarism', 'Check plagiarism for: {text}'),
('tool_seo_title_generator', 'seo-title-generator', 'SEO Title Generator', true, 2, 10, 200, 2, 'gpt-4o-mini', 'Generate SEO titles for: {topic}'),
('tool_meta_description_generator', 'meta-description-generator', 'Meta Description Generator', true, 2, 10, 200, 2, 'gpt-4o-mini', 'Generate meta description for: {topic}'),
('tool_keyword_research', 'keyword-research', 'Keyword Research', true, 1, 5, 50, 15, 'gpt-4o', 'Research keywords for: {niche}'),
('tool_website_audit', 'website-audit', 'Website Audit', true, 1, 1, 10, 25, 'custom-audit', 'Audit website: {url}'),
('tool_rank_tracker', 'rank-tracker', 'Rank Tracker', true, 1, 1, 20, 20, 'custom-rank', 'Track rankings for: {keyword}'),
('tool_backlink_checker', 'backlink-checker', 'Backlink Checker', true, 1, 1, 15, 18, 'custom-backlink', 'Analyze backlinks for: {url}')
on conflict (tool_slug) do nothing;

-- ============================================================
-- AI MODELS
-- ============================================================
insert into public.ai_models (id, provider, model_name, api_key_secret_name, is_enabled, is_default, cost_input, cost_output) values
('model_gemini', 'Google', 'Gemini Pro', 'GEMINI_API_KEY', true, true, 0.000002, 0.000003),
('model_openai_gpt4o', 'OpenAI', 'GPT-4o', 'OPENAI_API_KEY', true, false, 0.000005, 0.000015),
('model_openai_gpt4o_mini', 'OpenAI', 'GPT-4o-mini', 'OPENAI_API_KEY', true, true, 0.000001, 0.000002),
('model_deepseek', 'DeepSeek', 'DeepSeek V3', 'DEEPSEEK_API_KEY', true, false, 0.000001, 0.000002),
('model_claude', 'Anthropic', 'Claude 3.5 Sonnet', 'ANTHROPIC_API_KEY', true, false, 0.000003, 0.000015)
on conflict (id) do nothing;

-- ============================================================
-- BLOG CATEGORIES
-- ============================================================
insert into public.blog_categories (id, name, slug) values
('cat_ai_writing', 'AI Writing', 'ai-writing'),
('cat_seo', 'SEO', 'seo'),
('cat_content_marketing', 'Content Marketing', 'content-marketing'),
('cat_tools', 'Tools', 'tools')
on conflict (slug) do nothing;

-- ============================================================
-- SITE SETTINGS
-- ============================================================
insert into public.site_settings (key, value) values
('site_name', '{"value": "Nextill AI"}'),
('site_url', '{"value": "https://nextill.ai"}'),
('free_daily_limit', '{"value": 5}'),
('maintenance_mode', '{"value": false}'),
('contact_email', '{"value": "support@nextill.ai"}')
on conflict (key) do nothing;
