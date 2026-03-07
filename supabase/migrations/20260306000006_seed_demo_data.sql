-- Seed data: realistic Direct Response operation demo
-- 3 produtos: Alpha Pro (winner), Beta Elite (scaling US), Gamma FX (testing)
-- Safe: uses ON CONFLICT / IF NULL guards — can be run once

-- ================================================================
-- FIX: add columns missing from remote ad_campaigns table
-- (table was created via dashboard with a different schema)
-- ================================================================
ALTER TABLE ad_campaigns
  ADD COLUMN IF NOT EXISTS roas    NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status  TEXT,
  ADD COLUMN IF NOT EXISTS budget  TEXT,
  ADD COLUMN IF NOT EXISTS cpa     NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpm     NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpc     NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ctr     TEXT,
  ADD COLUMN IF NOT EXISTS hook    TEXT,
  ADD COLUMN IF NOT EXISTS conv_body TEXT,
  ADD COLUMN IF NOT EXISTS sales   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profit  NUMERIC DEFAULT 0;

DO $$
DECLARE
  v_user_id      UUID;
  v_platform_fb  UUID;
  v_platform_goog UUID;
BEGIN
  -- Grab admin user from profiles (user_id FKs reference profiles, not auth.users)
  SELECT id INTO v_user_id FROM profiles ORDER BY created_at LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No profiles found — skipping user-dependent seed data';
    RETURN;
  END IF;

  -- Skip if already seeded (idempotent guard)
  IF EXISTS (SELECT 1 FROM assets WHERE product = 'Alpha Pro' LIMIT 1) THEN
    RAISE NOTICE 'Seed data already present — skipping';
    RETURN;
  END IF;

  -- ================================================================
  -- PLATFORMS (get existing or create)
  -- ================================================================
  SELECT id INTO v_platform_fb
    FROM platforms WHERE name ILIKE '%facebook%' OR name ILIKE '%meta%' LIMIT 1;
  IF v_platform_fb IS NULL THEN
    INSERT INTO platforms (name, type, user_id, balance, currency)
    VALUES ('Facebook Ads', 'digital', v_user_id, 0, 'USD')
    RETURNING id INTO v_platform_fb;
  END IF;

  SELECT id INTO v_platform_goog
    FROM platforms WHERE name ILIKE '%google%' LIMIT 1;
  IF v_platform_goog IS NULL THEN
    INSERT INTO platforms (name, type, user_id, balance, currency)
    VALUES ('Google Ads', 'digital', v_user_id, 0, 'USD')
    RETURNING id INTO v_platform_goog;
  END IF;

  -- ================================================================
  -- ASSETS (shared — no user_id)
  -- ================================================================
  INSERT INTO assets (product, asset_type, name, country, status, link_or_id, notes) VALUES
    -- Alpha Pro
    ('Alpha Pro',  'domain',      'alphapro.com.br',             'BR', 'online',  'https://alphapro.com.br',   'Landing principal'),
    ('Alpha Pro',  'pixel',       'Pixel FB Alpha 001',          'BR', 'online',  '1234567890123456',          'Pixel principal FB'),
    ('Alpha Pro',  'ad_account',  'BM Alpha — Conta Principal',  'BR', 'online',  'act_9876543210',            'Conta primária'),
    ('Alpha Pro',  'checkout',    'Checkout Alpha — Stripe',     'BR', 'online',  'stripe_alpha_live',         'Checkout ativo'),
    -- Beta Elite
    ('Beta Elite', 'domain',      'betaelite.com',               'US', 'online',  'https://betaelite.com',     'Landing US'),
    ('Beta Elite', 'pixel',       'Pixel FB Beta 002',           'US', 'paused',  '9876543210987654',          'Pausado — revisão de evento'),
    ('Beta Elite', 'ad_account',  'BM Beta — US Account',        'US', 'online',  'act_1122334455',            NULL),
    ('Beta Elite', 'page',        'Beta Elite Official',          'US', 'online',  'BetaEliteOfficial',         'Fanpage principal US'),
    -- Gamma FX
    ('Gamma FX',   'domain',      'gammafx.io',                  'PT', 'online',  'https://gammafx.io',        'Lançamento Portugal'),
    ('Gamma FX',   'pixel',       'Pixel FB Gamma 003',          'PT', 'online',  '5544332211009988',          'Pixel PT — novo'),
    ('Gamma FX',   'ad_account',  'BM Gamma — Conta PT',         'PT', 'banned',  'act_5566778899',            'Banida — criar substituta urgente'),
    ('Gamma FX',   'email',       'gamma@sendgrid',              'PT', 'online',  'SG.gamma_prod',             'Sequência follow-up 5 emails');

  -- ================================================================
  -- CREATIVES (shared — no user_id)
  -- ================================================================
  INSERT INTO creatives (product, name, creative_type, hook, platform, status, notes) VALUES
    -- Alpha Pro
    ('Alpha Pro',  'Alpha VSL v1 — Dor de cabeça',    'video',    'Você sabia que 90% das pessoas fazem X errado?',  'Facebook', 'active',  'ROAS 4.2 — winner confirmado, escalar'),
    ('Alpha Pro',  'Alpha Carrossel Benefícios',       'carousel', '3 razões para você precisar de Alpha Pro',        'Facebook', 'active',  'CTR 3.8% — bom desempenho'),
    ('Alpha Pro',  'Alpha Copy Long-form v2',          'copy',     'A história que mudou tudo...',                    'Facebook', 'testing', 'Teste com headline nova — dia 4'),
    ('Alpha Pro',  'Alpha Banner Estático Q1',         'image',    NULL,                                              'Google',   'paused',  'ROAS 1.1 — pausado, aguardando nova versão'),
    -- Beta Elite
    ('Beta Elite', 'Beta VSL US — Pain Angle',         'video',    'If you''ve been struggling with X...',           'Facebook', 'active',  'Best performer US — ROAS 5.1'),
    ('Beta Elite', 'Beta Image Ad — Before/After',     'image',    NULL,                                              'Facebook', 'testing', 'Aguardando 3 dias de dados'),
    ('Beta Elite', 'Beta Copy Short-form',             'copy',     'They said it was impossible...',                  'Facebook', 'dead',    'ROAS 0.8 — descontinuado'),
    -- Gamma FX
    ('Gamma FX',   'Gamma Lançamento VSL PT',          'video',    'O sistema que ninguém no Brasil conhece...',      'Facebook', 'testing', 'Semana 1 — aguardando dados estáveis'),
    ('Gamma FX',   'Gamma Carrossel Depoimentos',      'carousel', NULL,                                              'Facebook', 'testing', 'Social proof — dia 2');

  -- ================================================================
  -- AD PERFORMANCE / CASH FLOW (needs user_id)
  -- platform CHECK: 'meta', 'google', 'twitter', 'tiktok', 'other'
  -- ================================================================
  INSERT INTO ad_performance (user_id, date, product, platform, investment, revenue, sales) VALUES
    -- Alpha Pro — meta (winner, escalando)
    (v_user_id, CURRENT_DATE - 29, 'Alpha Pro',  'meta',   850.00,  3230.00, 18),
    (v_user_id, CURRENT_DATE - 28, 'Alpha Pro',  'meta',   920.00,  3680.00, 20),
    (v_user_id, CURRENT_DATE - 27, 'Alpha Pro',  'meta',   780.00,  2808.00, 16),
    (v_user_id, CURRENT_DATE - 26, 'Alpha Pro',  'google', 310.00,   930.00,  5),
    (v_user_id, CURRENT_DATE - 25, 'Alpha Pro',  'meta',  1050.00,  4200.00, 24),
    (v_user_id, CURRENT_DATE - 24, 'Alpha Pro',  'meta',  1100.00,  4840.00, 27),
    (v_user_id, CURRENT_DATE - 23, 'Alpha Pro',  'google', 420.00,  1344.00,  7),
    (v_user_id, CURRENT_DATE - 22, 'Alpha Pro',  'meta',  1250.00,  5625.00, 31),
    (v_user_id, CURRENT_DATE - 21, 'Alpha Pro',  'meta',  1300.00,  5850.00, 32),
    (v_user_id, CURRENT_DATE - 20, 'Alpha Pro',  'meta',   980.00,  3920.00, 22),
    (v_user_id, CURRENT_DATE - 19, 'Alpha Pro',  'google', 350.00,  1190.00,  6),
    (v_user_id, CURRENT_DATE - 18, 'Alpha Pro',  'meta',  1400.00,  6300.00, 35),
    (v_user_id, CURRENT_DATE - 17, 'Alpha Pro',  'meta',  1500.00,  7200.00, 40),
    (v_user_id, CURRENT_DATE - 16, 'Alpha Pro',  'meta',  1600.00,  7680.00, 43),
    (v_user_id, CURRENT_DATE - 15, 'Alpha Pro',  'meta',  1450.00,  6525.00, 36),
    (v_user_id, CURRENT_DATE - 14, 'Alpha Pro',  'meta',  1550.00,  7285.00, 40),
    (v_user_id, CURRENT_DATE - 13, 'Alpha Pro',  'google', 480.00,  1680.00,  9),
    (v_user_id, CURRENT_DATE - 12, 'Alpha Pro',  'meta',  1700.00,  8160.00, 45),
    (v_user_id, CURRENT_DATE - 11, 'Alpha Pro',  'meta',  1800.00,  9000.00, 50),
    (v_user_id, CURRENT_DATE - 10, 'Alpha Pro',  'meta',  1650.00,  8085.00, 45),
    (v_user_id, CURRENT_DATE - 9,  'Alpha Pro',  'meta',  1750.00,  8750.00, 48),
    (v_user_id, CURRENT_DATE - 8,  'Alpha Pro',  'meta',  1900.00,  9690.00, 54),
    (v_user_id, CURRENT_DATE - 7,  'Alpha Pro',  'google', 550.00,  2090.00, 11),
    (v_user_id, CURRENT_DATE - 6,  'Alpha Pro',  'meta',  2000.00, 10400.00, 58),
    (v_user_id, CURRENT_DATE - 5,  'Alpha Pro',  'meta',  2100.00, 10920.00, 60),
    (v_user_id, CURRENT_DATE - 4,  'Alpha Pro',  'meta',  2200.00, 11440.00, 63),
    (v_user_id, CURRENT_DATE - 3,  'Alpha Pro',  'meta',  2050.00, 10455.00, 58),
    (v_user_id, CURRENT_DATE - 2,  'Alpha Pro',  'meta',  2150.00, 11180.00, 62),
    (v_user_id, CURRENT_DATE - 1,  'Alpha Pro',  'meta',  2300.00, 12190.00, 68),
    -- Beta Elite — meta (scaling US)
    (v_user_id, CURRENT_DATE - 20, 'Beta Elite', 'meta',   620.00,  3224.00, 14),
    (v_user_id, CURRENT_DATE - 19, 'Beta Elite', 'meta',   680.00,  3536.00, 15),
    (v_user_id, CURRENT_DATE - 18, 'Beta Elite', 'meta',   540.00,  2700.00, 12),
    (v_user_id, CURRENT_DATE - 17, 'Beta Elite', 'meta',   710.00,  3692.00, 16),
    (v_user_id, CURRENT_DATE - 16, 'Beta Elite', 'meta',   650.00,  3185.00, 14),
    (v_user_id, CURRENT_DATE - 15, 'Beta Elite', 'meta',   730.00,  3796.00, 17),
    (v_user_id, CURRENT_DATE - 14, 'Beta Elite', 'meta',   500.00,  2250.00, 10),
    (v_user_id, CURRENT_DATE - 13, 'Beta Elite', 'meta',   760.00,  3952.00, 17),
    (v_user_id, CURRENT_DATE - 12, 'Beta Elite', 'meta',   820.00,  4264.00, 19),
    (v_user_id, CURRENT_DATE - 11, 'Beta Elite', 'meta',   890.00,  4628.00, 20),
    (v_user_id, CURRENT_DATE - 10, 'Beta Elite', 'meta',   950.00,  4940.00, 22),
    (v_user_id, CURRENT_DATE - 9,  'Beta Elite', 'meta',  1000.00,  5300.00, 23),
    (v_user_id, CURRENT_DATE - 8,  'Beta Elite', 'meta',  1050.00,  5565.00, 25),
    (v_user_id, CURRENT_DATE - 7,  'Beta Elite', 'meta',  1100.00,  5720.00, 26),
    (v_user_id, CURRENT_DATE - 6,  'Beta Elite', 'meta',  1150.00,  5980.00, 27),
    (v_user_id, CURRENT_DATE - 5,  'Beta Elite', 'meta',  1200.00,  6360.00, 28),
    (v_user_id, CURRENT_DATE - 4,  'Beta Elite', 'meta',  1250.00,  6625.00, 30),
    (v_user_id, CURRENT_DATE - 3,  'Beta Elite', 'meta',  1300.00,  6760.00, 31),
    (v_user_id, CURRENT_DATE - 2,  'Beta Elite', 'meta',  1350.00,  7020.00, 32),
    (v_user_id, CURRENT_DATE - 1,  'Beta Elite', 'meta',  1400.00,  7420.00, 34),
    -- Gamma FX (testando, últimos 7 dias)
    (v_user_id, CURRENT_DATE - 7,  'Gamma FX',  'meta',   400.00,   520.00,  3),
    (v_user_id, CURRENT_DATE - 6,  'Gamma FX',  'meta',   380.00,   456.00,  2),
    (v_user_id, CURRENT_DATE - 5,  'Gamma FX',  'meta',   420.00,   630.00,  4),
    (v_user_id, CURRENT_DATE - 4,  'Gamma FX',  'meta',   450.00,   810.00,  5),
    (v_user_id, CURRENT_DATE - 3,  'Gamma FX',  'meta',   410.00,   738.00,  4),
    (v_user_id, CURRENT_DATE - 2,  'Gamma FX',  'meta',   480.00,   912.00,  6),
    (v_user_id, CURRENT_DATE - 1,  'Gamma FX',  'meta',   500.00,  1000.00,  7);

  -- ================================================================
  -- AD CAMPAIGNS / CAMPAIGN CONTROL (needs user_id + platform_id)
  -- ================================================================
  INSERT INTO ad_campaigns (user_id, platform_id, campaign_name, product, country, spend, revenue, roas, status, impressions, clicks, conversions) VALUES
    -- Alpha Pro — escalando
    (v_user_id, v_platform_fb,   'Alpha Pro — VSL Principal BR',       'Alpha Pro',  'BR', 45200.00, 203400.00, 4.50, 'escalando', 1250000, 18750, 250),
    (v_user_id, v_platform_fb,   'Alpha Pro — Lookalike 1% BR',        'Alpha Pro',  'BR', 28500.00, 114000.00, 4.00, 'escalando',  850000, 12200, 158),
    (v_user_id, v_platform_goog, 'Alpha Pro — Google Search BR',       'Alpha Pro',  'BR', 12400.00,  37200.00, 3.00, 'testando',   380000,  9500,  65),
    -- Beta Elite — escalando US
    (v_user_id, v_platform_fb,   'Beta Elite — VSL US TOF',            'Beta Elite', 'US', 38600.00, 196860.00, 5.10, 'escalando',  980000, 14700, 185),
    (v_user_id, v_platform_fb,   'Beta Elite — Retargeting 7d',        'Beta Elite', 'US',  8200.00,  28700.00, 3.50, 'escalando',  220000,  6600,  82),
    (v_user_id, v_platform_fb,   'Beta Elite — Broad Interest US',     'Beta Elite', 'US', 15400.00,  30800.00, 2.00, 'testando',   620000, 10850, 108),
    -- Gamma FX — testando
    (v_user_id, v_platform_fb,   'Gamma FX — Lançamento PT TOF',       'Gamma FX',   'PT',  2640.00,   4488.00, 1.70, 'testando',   185000,  3700,  32),
    (v_user_id, v_platform_fb,   'Gamma FX — VSL Alternativa PT',      'Gamma FX',   'PT',  1890.00,   2268.00, 1.20, 'testando',   142000,  2840,  21),
    -- Pausar / Morto
    (v_user_id, v_platform_fb,   'Alpha — Broad Interest Descont.',    'Alpha Pro',  'BR',  9800.00,   7840.00, 0.80, 'morto',      450000,  5400,  42),
    (v_user_id, v_platform_fb,   'Beta Elite — Interest Stacked',      'Beta Elite', 'US',  5600.00,   7840.00, 1.40, 'pausar',     198000,  2970,  38);

  RAISE NOTICE 'Seed data inserted successfully for user %', v_user_id;
END $$;
