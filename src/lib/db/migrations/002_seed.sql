-- Seed data for Nextill AI

-- Seed plans
INSERT INTO plans (id, name, slug, price, monthly_credits, tool_access, max_projects, max_users, priority, description) VALUES
('plan_free', 'Free', 'free', 0, 500, '{ai_writer,ai_humanizer,ai_detector}', 1, 1, 'low', 'Basic access to AI writing tools'),
('plan_starter', 'Starter', 'starter', 29, 2000, '{ai_writer,ai_humanizer,ai_detector,plagiarism_checker,seo_title_generator,meta_description_generator}', 3, 1, 'medium', 'For individual creators'),
('plan_pro', 'Pro', 'pro', 79, 5000, '{ai_writer,ai_humanizer,ai_detector,plagiarism_checker,seo_title_generator,meta_description_generator,keyword_research,website_audit}', 10, 3, 'high', 'For professional content teams'),
('plan_agency', 'Agency', 'agency', 149, 15000, '{ai_writer,ai_humanizer,ai_detector,plagiarism_checker,seo_title_generator,meta_description_generator,keyword_research,website_audit,rank_tracker,backlink_analyzer}', 50, 10, 'high', 'For agencies and large teams'),
('plan_enterprise', 'Enterprise', 'enterprise', 299, 50000, '{ai_writer,ai_humanizer,ai_detector,plagiarism_checker,seo_title_generator,meta_description_generator,keyword_research,website_audit,rank_tracker,backlink_analyzer}', 999, 999, 'urgent', 'Custom enterprise solution')
ON CONFLICT (id) DO NOTHING;

-- Seed tool settings
INSERT INTO tool_settings (id, name, slug, enabled, guest_limit, free_limit, premium_limit, credits_cost, model, usage_count) VALUES
('tool_1', 'AI Writer', 'ai_writer', true, 1, 5, 100, 10, 'gpt-4o', 45210),
('tool_2', 'AI Humanizer', 'ai_humanizer', true, 1, 3, 50, 5, 'gpt-4o', 32100),
('tool_3', 'AI Detector', 'ai_detector', true, 1, 5, 100, 3, 'custom_ai_detector', 28400),
('tool_4', 'Plagiarism Checker', 'plagiarism_checker', true, 0, 2, 30, 8, 'custom_plagiarism', 18500),
('tool_5', 'SEO Title Generator', 'seo_title_generator', true, 2, 10, 200, 2, 'gpt-4o-mini', 15300),
('tool_6', 'Meta Description Generator', 'meta_description_generator', true, 2, 10, 200, 2, 'gpt-4o-mini', 14200),
('tool_7', 'Keyword Research', 'keyword_research', true, 1, 5, 50, 15, 'gpt-4o', 9800),
('tool_8', 'Website Audit', 'website_audit', false, 0, 1, 10, 25, 'custom_audit', 3200),
('tool_9', 'Rank Tracker', 'rank_tracker', true, 0, 1, 20, 20, 'custom_rank', 5600),
('tool_10', 'Backlink Analyzer', 'backlink_analyzer', false, 0, 1, 15, 18, 'custom_backlink', 2100)
ON CONFLICT (id) DO NOTHING;

-- Seed AI models
INSERT INTO ai_models (id, name, provider, enabled, api_key_placeholder, default_for, fallback, usage_count, cost_per_request, monthly_cost) VALUES
('model_1', 'GPT-4o', 'OpenAI', true, 'sk-...', '{ai_writer,ai_humanizer,keyword_research}', false, 45000, 0.01, 450),
('model_2', 'GPT-4o-mini', 'OpenAI', true, 'sk-...', '{seo_title_generator,meta_description_generator}', true, 30000, 0.003, 90),
('model_3', 'Gemini Pro', 'Google', true, 'AIza...', '{}', true, 12000, 0.005, 60),
('model_4', 'Claude 3.5 Sonnet', 'Anthropic', true, 'sk-ant-...', '{ai_detector}', false, 8000, 0.015, 120),
('model_5', 'DeepSeek V3', 'DeepSeek', false, 'sk-...', '{}', false, 0, 0.002, 0),
('model_6', 'Custom Model', 'Self-Hosted', true, 'custom-key', '{plagiarism_checker,website_audit,rank_tracker,backlink_analyzer}', false, 11000, 0.001, 11)
ON CONFLICT (id) DO NOTHING;

-- Seed site settings
INSERT INTO site_settings (id, site_name, primary_color, free_daily_limits, contact_email, social_links, seo_meta_defaults)
VALUES (
  'default',
  'Nextill AI',
  '#6366f1',
  5,
  'support@nextill.ai',
  '[{"platform":"Twitter","url":"https://twitter.com/Nextill"},{"platform":"LinkedIn","url":"https://linkedin.com/company/nextill"}]',
  '{"title":"Nextill AI - Enterprise AI SEO Platform","description":"Enterprise AI-powered SEO and content creation platform."}'
)
ON CONFLICT (id) DO NOTHING;

-- Seed blog categories
INSERT INTO blog_categories (name) VALUES
('AI & SEO'), ('Content Writing'), ('SEO'), ('SEO Tools'), ('AI'), ('Product Updates'), ('Tutorials')
ON CONFLICT (name) DO NOTHING;

-- Seed blog posts
INSERT INTO blog_posts (title, slug, category, seo_title, meta_description, status, author) VALUES
('How AI is Transforming SEO in 2026', 'ai-transforming-seo-2026', 'AI & SEO', 'AI Transforming SEO 2026 | Nextill', 'Discover how AI is revolutionizing SEO strategies in 2026.', 'published', 'John Doe'),
('10 Tips for Better AI Content', '10-tips-ai-content', 'Content Writing', '10 Tips for Better AI Content | Nextill', 'Improve your AI-generated content with these tips.', 'published', 'Jane Smith'),
('Understanding Google E-E-A-T', 'understanding-google-e-e-a-t', 'SEO', 'Understanding Google E-E-A-T | Nextill', 'Learn about Google E-E-A-T guidelines.', 'draft', 'John Doe'),
('Keyword Research in 2026', 'keyword-research-2026', 'SEO Tools', 'Keyword Research 2026 | Nextill', 'Modern keyword research strategies for 2026.', 'published', 'Bob Wilson'),
('The Future of AI Writing', 'future-of-ai-writing', 'AI', 'Future of AI Writing | Nextill', 'What is next for AI writing technology?', 'draft', 'Jane Smith')
ON CONFLICT (id) DO NOTHING;

-- Seed coupons
INSERT INTO coupons (code, type, value, expiry_date, usage_limit, usage_count, active) VALUES
('LAUNCH20', 'percentage', 20, '2026-12-31', 100, 45, true),
('SAVE50', 'fixed', 50, '2026-09-30', 50, 12, true),
('PRO30', 'percentage', 30, '2026-08-15', 200, 78, true),
('EXPIRED10', 'percentage', 10, '2025-12-31', 500, 500, false),
('WELCOME25', 'percentage', 25, '2026-10-01', 1000, 234, true)
ON CONFLICT (code) DO NOTHING;

-- Seed security logs
INSERT INTO security_logs (type, action, ip_hash, user_agent) VALUES
('failed_login', 'Failed login attempt (unknown user)', 'p6q7r8s9t0', 'curl/8.0...'),
('failed_login', 'Brute force attempt detected', 'u1v2w3x4y5', 'Python/3.11'),
('login', 'Successful login from admin panel', 'a1b2c3d4e5', 'Mozilla/5.0...');

-- Seed contact messages
INSERT INTO contact_messages (name, email, subject, message, read) VALUES
('Sarah Connor', 'sarah@example.com', 'Billing Issue', 'I was charged twice for my subscription this month. Please help.', false),
('Mike Peters', 'mike@example.com', 'Feature Request', 'Can you add support for more languages in the translator tool?', false),
('Lisa Ray', 'lisa@example.com', 'Account Suspension', 'My account was suspended and I do not know why. Please review.', true)
ON CONFLICT DO NOTHING;

-- Seed analytics
INSERT INTO analytics (date, total_users, new_users, active_users, total_revenue, credits_used, conversion_rate)
SELECT
  d::date,
  floor(random() * 1000 + 100)::int,
  floor(random() * 50 + 5)::int,
  floor(random() * 200 + 50)::int,
  floor(random() * 5000 + 500)::decimal,
  floor(random() * 10000 + 1000)::int,
  round((random() * 15 + 5)::decimal, 2)
FROM generate_series('2026-01-01'::date, '2026-07-03'::date, '1 day'::interval) AS d
ON CONFLICT (date) DO NOTHING;
