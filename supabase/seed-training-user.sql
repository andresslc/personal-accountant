-- =============================================================================
-- Seed data for training user: ed8dc72e-e889-4d7d-ae6e-9d21a659c251
-- 3 months of realistic Colombian financial data (Jan–Mar 2026)
-- Currency: COP (Colombian Pesos)
-- Idempotent: safe to re-run (deletes existing data first)
-- =============================================================================

BEGIN;

DO $$
DECLARE
  uid UUID := 'ed8dc72e-e889-4d7d-ae6e-9d21a659c251';
  lid_nu BIGINT;
  lid_car BIGINT;
  lid_icetex BIGINT;
  lid_personal BIGINT;
BEGIN

-- =============================================================================
-- 1. CLEANUP (reverse FK order)
-- =============================================================================
DELETE FROM chat_summaries WHERE user_id = uid;
DELETE FROM user_financial_memory WHERE user_id = uid;
DELETE FROM transactions WHERE user_id = uid;
DELETE FROM budget_items WHERE user_id = uid;
DELETE FROM subscriptions WHERE user_id = uid;
DELETE FROM liabilities WHERE user_id = uid;

-- =============================================================================
-- 2. LIABILITIES (4 rows)
-- =============================================================================
INSERT INTO liabilities (user_id, name, type, current_balance, original_balance, min_payment, apr, due_day)
VALUES (uid, 'Tarjeta Nu Colombia', 'credit-card', 2850000, 4000000, 285000, 28.50, 15)
RETURNING id INTO lid_nu;

INSERT INTO liabilities (user_id, name, type, current_balance, original_balance, min_payment, apr, due_day)
VALUES (uid, 'Credito Vehicular Bancolombia', 'car', 18500000, 35000000, 650000, 12.80, 10)
RETURNING id INTO lid_car;

INSERT INTO liabilities (user_id, name, type, current_balance, original_balance, min_payment, apr, due_day)
VALUES (uid, 'Icetex Pregrado', 'student', 8200000, 12000000, 320000, 8.50, 20)
RETURNING id INTO lid_icetex;

INSERT INTO liabilities (user_id, name, type, current_balance, original_balance, min_payment, apr, due_day)
VALUES (uid, 'Prestamo Personal Davivienda', 'personal', 3500000, 5000000, 280000, 18.90, 5)
RETURNING id INTO lid_personal;

-- =============================================================================
-- 3. BUDGET ITEMS (7 categories × 3 months = 21 rows)
-- =============================================================================
INSERT INTO budget_items (user_id, category_id, budget_limit, recurring, month_year) VALUES
  -- January 2026
  (uid, 'groceries',      800000,  true, '2026-01-01'),
  (uid, 'rent',          1800000,  true, '2026-01-01'),
  (uid, 'utilities',      450000,  true, '2026-01-01'),
  (uid, 'entertainment',  350000,  true, '2026-01-01'),
  (uid, 'shopping',       500000,  true, '2026-01-01'),
  (uid, 'healthcare',     200000,  true, '2026-01-01'),
  (uid, 'transportation', 300000,  true, '2026-01-01'),
  -- February 2026
  (uid, 'groceries',      800000,  true, '2026-02-01'),
  (uid, 'rent',          1800000,  true, '2026-02-01'),
  (uid, 'utilities',      450000,  true, '2026-02-01'),
  (uid, 'entertainment',  350000,  true, '2026-02-01'),
  (uid, 'shopping',       500000,  true, '2026-02-01'),
  (uid, 'healthcare',     200000,  true, '2026-02-01'),
  (uid, 'transportation', 300000,  true, '2026-02-01'),
  -- March 2026
  (uid, 'groceries',      800000,  true, '2026-03-01'),
  (uid, 'rent',          1800000,  true, '2026-03-01'),
  (uid, 'utilities',      450000,  true, '2026-03-01'),
  (uid, 'entertainment',  350000,  true, '2026-03-01'),
  (uid, 'shopping',       500000,  true, '2026-03-01'),
  (uid, 'healthcare',     200000,  true, '2026-03-01'),
  (uid, 'transportation', 300000,  true, '2026-03-01');

-- =============================================================================
-- 4. SUBSCRIPTIONS (6 rows)
-- =============================================================================
INSERT INTO subscriptions (user_id, name, amount, frequency, next_due_date, active) VALUES
  (uid, 'Netflix',          49900,  'Monthly', '2026-04-05', true),
  (uid, 'Spotify',          16900,  'Monthly', '2026-04-12', true),
  (uid, 'Amazon Prime',     27900,  'Monthly', '2026-04-01', true),
  (uid, 'iCloud 50GB',      12900,  'Monthly', '2026-04-18', true),
  (uid, 'Microsoft 365',   289000,  'Yearly',  '2027-01-15', true),
  (uid, 'SmartFit Gym',     89900,  'Monthly', '2026-02-01', false);

-- =============================================================================
-- 5. TRANSACTIONS
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- JANUARY 2026 — Full month
-- ─────────────────────────────────────────────────────────────────────────────

-- Income (5 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-01-01', 'Salario quincenal - Empresa TechCol SAS',     3200000, 'income', 'salary',   'Bank Transfer'),
  (uid, '2026-01-15', 'Salario quincenal - Empresa TechCol SAS',     3200000, 'income', 'salary',   'Bank Transfer'),
  (uid, '2026-01-08', 'Freelance diseño web - Cliente Restaurante',   850000, 'income', 'freelance','Bank Transfer'),
  (uid, '2026-01-20', 'Freelance landing page - Startup Fintech',    1200000, 'income', 'freelance','Bank Transfer'),
  (uid, '2026-01-28', 'Freelance mantenimiento sitio web',            400000, 'income', 'freelance','Bank Transfer');

-- Groceries (10 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-01-02', 'Mercado semanal Éxito Envigado',              245000, 'expense', 'groceries', 'Debit Card'),
  (uid, '2026-01-05', 'Frutas y verduras Plaza Minorista',             68000, 'expense', 'groceries', 'Cash'),
  (uid, '2026-01-09', 'Mercado D1 productos básicos',                  87000, 'expense', 'groceries', 'Cash'),
  (uid, '2026-01-12', 'Carulla Express carnes y lácteos',             156000, 'expense', 'groceries', 'Credit Card'),
  (uid, '2026-01-16', 'Mercado semanal Jumbo Centro Mayor',           210000, 'expense', 'groceries', 'Debit Card'),
  (uid, '2026-01-19', 'Tienda Ara snacks y bebidas',                   45000, 'expense', 'groceries', 'Cash'),
  (uid, '2026-01-22', 'Éxito productos de aseo y despensa',           178000, 'expense', 'groceries', 'Debit Card'),
  (uid, '2026-01-25', 'D1 leche, huevos, pan',                         52000, 'expense', 'groceries', 'Cash'),
  (uid, '2026-01-28', 'Jumbo mercado quincenal',                      195000, 'expense', 'groceries', 'Credit Card'),
  (uid, '2026-01-31', 'Carulla frutas para la semana',                  63000, 'expense', 'groceries', 'Debit Card');

-- Rent (1 txn)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-01-01', 'Arriendo apartamento Envigado',              1800000, 'expense', 'rent', 'Bank Transfer');

-- Utilities (5 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-01-05', 'EPM energía eléctrica enero',                 135000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-01-06', 'Aguas de Bogotá acueducto',                    78000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-01-08', 'ETB Internet fibra óptica 300Mbps',           120000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-01-10', 'Claro plan celular postpago',                   89000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-01-12', 'Gas Natural Vanti factura bimestral',           55000, 'expense', 'utilities', 'Bank Transfer');

-- Entertainment (6 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-01-05', 'Netflix suscripción mensual',                   49900, 'expense', 'entertainment', 'Credit Card'),
  (uid, '2026-01-12', 'Spotify Premium familiar',                      16900, 'expense', 'entertainment', 'Credit Card'),
  (uid, '2026-01-10', 'Cine Procinal Unicentro x2',                    48000, 'expense', 'entertainment', 'Debit Card'),
  (uid, '2026-01-17', 'Restaurante Crepes & Waffles cena',            125000, 'expense', 'entertainment', 'Credit Card'),
  (uid, '2026-01-24', 'Bowling Salitre Mágico',                        65000, 'expense', 'entertainment', 'Cash'),
  (uid, '2026-01-30', 'Amazon Prime Video suscripción',                 27900, 'expense', 'entertainment', 'Credit Card');

-- Shopping (4 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-01-07', 'MercadoLibre audífonos inalámbricos',          189000, 'expense', 'shopping', 'Credit Card'),
  (uid, '2026-01-14', 'Falabella ropa casual',                        245000, 'expense', 'shopping', 'Credit Card'),
  (uid, '2026-01-21', 'Homecenter organizador escritorio',              85000, 'expense', 'shopping', 'Debit Card'),
  (uid, '2026-01-29', 'Amazon Colombia teclado mecánico',              350000, 'expense', 'shopping', 'Credit Card');

-- Healthcare (2 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-01-13', 'Farmacia Pasteur medicamentos',                  45000, 'expense', 'healthcare', 'Cash'),
  (uid, '2026-01-27', 'EPS Sura copago consulta general',               25000, 'expense', 'healthcare', 'Debit Card');

-- Transportation (7 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-01-03', 'Tanqueo gasolina Terpel',                      120000, 'expense', 'transportation', 'Debit Card'),
  (uid, '2026-01-06', 'Recarga TransMilenio',                           50000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-01-11', 'Uber trayecto aeropuerto',                       38000, 'expense', 'transportation', 'Credit Card'),
  (uid, '2026-01-15', 'Tanqueo gasolina Primax',                       115000, 'expense', 'transportation', 'Debit Card'),
  (uid, '2026-01-20', 'Peaje Autopista Norte x2',                       18000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-01-25', 'InDriver trayecto Chapinero',                    15000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-01-30', 'Tanqueo gasolina Biomax',                       110000, 'expense', 'transportation', 'Debit Card');

-- Debt payments January (4 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method, liability_id) VALUES
  (uid, '2026-01-05', 'Pago cuota Prestamo Personal Davivienda',      280000, 'debt-payment', 'other', 'Bank Transfer', lid_personal),
  (uid, '2026-01-10', 'Pago cuota Credito Vehicular Bancolombia',     650000, 'debt-payment', 'other', 'Bank Transfer', lid_car),
  (uid, '2026-01-15', 'Pago mínimo Tarjeta Nu Colombia',              285000, 'debt-payment', 'other', 'Bank Transfer', lid_nu),
  (uid, '2026-01-20', 'Pago cuota Icetex Pregrado',                   320000, 'debt-payment', 'other', 'Bank Transfer', lid_icetex);

-- ─────────────────────────────────────────────────────────────────────────────
-- FEBRUARY 2026 — Full month
-- ─────────────────────────────────────────────────────────────────────────────

-- Income (4 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-02-01', 'Salario quincenal - Empresa TechCol SAS',     3200000, 'income', 'salary',   'Bank Transfer'),
  (uid, '2026-02-15', 'Salario quincenal - Empresa TechCol SAS',     3200000, 'income', 'salary',   'Bank Transfer'),
  (uid, '2026-02-10', 'Freelance app móvil - Consultora Digital',    1500000, 'income', 'freelance','Bank Transfer'),
  (uid, '2026-02-22', 'Freelance dashboard analytics',                750000, 'income', 'freelance','Bank Transfer');

-- Groceries (9 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-02-01', 'Mercado mensual Éxito Poblado',               280000, 'expense', 'groceries', 'Debit Card'),
  (uid, '2026-02-04', 'D1 productos básicos despensa',                 92000, 'expense', 'groceries', 'Cash'),
  (uid, '2026-02-08', 'Carulla carnes y pollo',                       145000, 'expense', 'groceries', 'Credit Card'),
  (uid, '2026-02-11', 'Ara productos de aseo',                          55000, 'expense', 'groceries', 'Cash'),
  (uid, '2026-02-14', 'Jumbo mercado San Valentín especial',           198000, 'expense', 'groceries', 'Debit Card'),
  (uid, '2026-02-18', 'Éxito frutas, verduras, lácteos',              167000, 'expense', 'groceries', 'Debit Card'),
  (uid, '2026-02-21', 'D1 snacks y bebidas',                            48000, 'expense', 'groceries', 'Cash'),
  (uid, '2026-02-25', 'Plaza Minorista mercado semanal',                72000, 'expense', 'groceries', 'Cash'),
  (uid, '2026-02-28', 'Carulla Express pan y lácteos',                  65000, 'expense', 'groceries', 'Debit Card');

-- Rent (1 txn)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-02-01', 'Arriendo apartamento Envigado',              1800000, 'expense', 'rent', 'Bank Transfer');

-- Utilities (5 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-02-04', 'EPM energía eléctrica febrero',               142000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-02-05', 'Aguas de Bogotá acueducto',                    82000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-02-07', 'ETB Internet fibra óptica 300Mbps',           120000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-02-09', 'Claro plan celular postpago',                   89000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-02-15', 'iCloud 50GB almacenamiento',                    12900, 'expense', 'utilities', 'Credit Card');

-- Entertainment (5 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-02-05', 'Netflix suscripción mensual',                   49900, 'expense', 'entertainment', 'Credit Card'),
  (uid, '2026-02-12', 'Spotify Premium familiar',                      16900, 'expense', 'entertainment', 'Credit Card'),
  (uid, '2026-02-14', 'Restaurante Andrés Carne de Res San Valentín', 185000, 'expense', 'entertainment', 'Credit Card'),
  (uid, '2026-02-21', 'Cine Royal Films x2 + crispetas',               58000, 'expense', 'entertainment', 'Debit Card'),
  (uid, '2026-02-28', 'Amazon Prime Video suscripción',                 27900, 'expense', 'entertainment', 'Credit Card');

-- Shopping (5 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-02-03', 'MercadoLibre funda portátil',                   75000, 'expense', 'shopping', 'Credit Card'),
  (uid, '2026-02-10', 'Falabella zapatos deportivos',                  289000, 'expense', 'shopping', 'Credit Card'),
  (uid, '2026-02-14', 'Floristería regalo San Valentín',               120000, 'expense', 'shopping', 'Cash'),
  (uid, '2026-02-20', 'Homecenter lámpara escritorio',                  95000, 'expense', 'shopping', 'Debit Card'),
  (uid, '2026-02-26', 'Alkosto mouse ergonómico',                       65000, 'expense', 'shopping', 'Debit Card');

-- Healthcare (3 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-02-06', 'Farmacia Colsubsidio vitaminas',                 38000, 'expense', 'healthcare', 'Cash'),
  (uid, '2026-02-18', 'EPS Sura consulta odontológica',                 35000, 'expense', 'healthcare', 'Debit Card'),
  (uid, '2026-02-25', 'Farmacia Pasteur crema y analgésicos',           52000, 'expense', 'healthcare', 'Cash');

-- Transportation (8 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-02-02', 'Tanqueo gasolina Terpel',                      118000, 'expense', 'transportation', 'Debit Card'),
  (uid, '2026-02-05', 'Recarga TransMilenio',                           50000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-02-09', 'Uber trayecto centro comercial',                  22000, 'expense', 'transportation', 'Credit Card'),
  (uid, '2026-02-13', 'Tanqueo gasolina Primax',                       112000, 'expense', 'transportation', 'Debit Card'),
  (uid, '2026-02-17', 'Peaje Ruta del Sol ida y vuelta',                 28000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-02-20', 'InDriver trayecto reunión cliente',               18000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-02-24', 'Lavado y aspirado vehículo',                      35000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-02-28', 'Tanqueo gasolina Biomax',                       108000, 'expense', 'transportation', 'Debit Card');

-- Debt payments February (4 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method, liability_id) VALUES
  (uid, '2026-02-05', 'Pago cuota Prestamo Personal Davivienda',      280000, 'debt-payment', 'other', 'Bank Transfer', lid_personal),
  (uid, '2026-02-10', 'Pago cuota Credito Vehicular Bancolombia',     650000, 'debt-payment', 'other', 'Bank Transfer', lid_car),
  (uid, '2026-02-15', 'Pago Tarjeta Nu Colombia abono extra',         350000, 'debt-payment', 'other', 'Bank Transfer', lid_nu),
  (uid, '2026-02-20', 'Pago cuota Icetex Pregrado',                   320000, 'debt-payment', 'other', 'Bank Transfer', lid_icetex);

-- ─────────────────────────────────────────────────────────────────────────────
-- MARCH 2026 — Partial month (through Mar 18, ~60% volume)
-- ─────────────────────────────────────────────────────────────────────────────

-- Income (3 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-03-01', 'Salario quincenal - Empresa TechCol SAS',     3200000, 'income', 'salary',   'Bank Transfer'),
  (uid, '2026-03-15', 'Salario quincenal - Empresa TechCol SAS',     3200000, 'income', 'salary',   'Bank Transfer'),
  (uid, '2026-03-12', 'Freelance consultoría UX - Ecommerce',         950000, 'income', 'freelance','Bank Transfer');

-- Groceries (6 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-03-01', 'Mercado mensual Éxito Laureles',              265000, 'expense', 'groceries', 'Debit Card'),
  (uid, '2026-03-04', 'D1 productos básicos',                          78000, 'expense', 'groceries', 'Cash'),
  (uid, '2026-03-08', 'Carulla carnes, frutas, verduras',             168000, 'expense', 'groceries', 'Credit Card'),
  (uid, '2026-03-11', 'Ara despensa semanal',                           62000, 'expense', 'groceries', 'Cash'),
  (uid, '2026-03-14', 'Jumbo mercado quincenal grande',               235000, 'expense', 'groceries', 'Debit Card'),
  (uid, '2026-03-17', 'D1 pan, leche, huevos',                          42000, 'expense', 'groceries', 'Cash');

-- Rent (1 txn)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-03-01', 'Arriendo apartamento Envigado',              1800000, 'expense', 'rent', 'Bank Transfer');

-- Utilities (4 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-03-03', 'EPM energía eléctrica marzo',                 128000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-03-04', 'Aguas de Bogotá acueducto',                    75000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-03-07', 'ETB Internet fibra óptica 300Mbps',           120000, 'expense', 'utilities', 'Bank Transfer'),
  (uid, '2026-03-10', 'Claro plan celular postpago',                   89000, 'expense', 'utilities', 'Bank Transfer');

-- Entertainment (4 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-03-05', 'Netflix suscripción mensual',                   49900, 'expense', 'entertainment', 'Credit Card'),
  (uid, '2026-03-12', 'Spotify Premium familiar',                      16900, 'expense', 'entertainment', 'Credit Card'),
  (uid, '2026-03-08', 'Restaurante Wok cena japonesa',                  98000, 'expense', 'entertainment', 'Credit Card'),
  (uid, '2026-03-15', 'Parque Simón Bolívar bicicleta alquiler',        25000, 'expense', 'entertainment', 'Cash');

-- Shopping (3 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-03-02', 'MercadoLibre hub USB-C',                       135000, 'expense', 'shopping', 'Credit Card'),
  (uid, '2026-03-09', 'Falabella camisa formal',                      165000, 'expense', 'shopping', 'Credit Card'),
  (uid, '2026-03-16', 'Homecenter plantas y macetas',                   78000, 'expense', 'shopping', 'Debit Card');

-- Healthcare (1 txn)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-03-10', 'EPS Sura copago consulta general',               25000, 'expense', 'healthcare', 'Debit Card');

-- Transportation (5 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-03-01', 'Tanqueo gasolina Terpel',                      122000, 'expense', 'transportation', 'Debit Card'),
  (uid, '2026-03-05', 'Recarga TransMilenio',                           50000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-03-09', 'Uber trayecto médico',                            28000, 'expense', 'transportation', 'Credit Card'),
  (uid, '2026-03-13', 'Tanqueo gasolina Primax',                       115000, 'expense', 'transportation', 'Debit Card'),
  (uid, '2026-03-18', 'Peaje Autopista Medellín-Bogotá',                 8000, 'expense', 'transportation', 'Cash');

-- Debt payments March (4 txns)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method, liability_id) VALUES
  (uid, '2026-03-05', 'Pago cuota Prestamo Personal Davivienda',      280000, 'debt-payment', 'other', 'Bank Transfer', lid_personal),
  (uid, '2026-03-10', 'Pago cuota Credito Vehicular Bancolombia',     650000, 'debt-payment', 'other', 'Bank Transfer', lid_car),
  (uid, '2026-03-15', 'Pago mínimo Tarjeta Nu Colombia',              300000, 'debt-payment', 'other', 'Bank Transfer', lid_nu),
  (uid, '2026-03-18', 'Pago cuota Icetex Pregrado',                   320000, 'debt-payment', 'other', 'Bank Transfer', lid_icetex);

-- ─────────────────────────────────────────────────────────────────────────────
-- ADDITIONAL TRANSACTIONS — daily life, misc expenses, extra income
-- ─────────────────────────────────────────────────────────────────────────────

-- JANUARY additional (~25 more)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-01-04', 'Panadería Pan Pa Ya desayuno',                  18000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-01-14', 'Helados Popsy postre',                          22000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-01-18', 'Café Juan Valdez granos 500g',                  35000, 'expense', 'groceries',      'Debit Card'),
  (uid, '2026-01-03', 'Café con amigos Juan Valdez',                   32000, 'expense', 'entertainment',  'Cash'),
  (uid, '2026-01-11', 'Karaoke bar La 85',                             75000, 'expense', 'entertainment',  'Credit Card'),
  (uid, '2026-01-19', 'Pizza Dominos delivery',                        58000, 'expense', 'entertainment',  'Credit Card'),
  (uid, '2026-01-26', 'Concierto teatro Colsubsidio',                 120000, 'expense', 'entertainment',  'Credit Card'),
  (uid, '2026-01-08', 'Parqueadero centro comercial',                   12000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-01-13', 'Uber Eats domicilio',                            8500, 'expense', 'transportation', 'Credit Card'),
  (uid, '2026-01-18', 'Rappi envío farmacia',                           9000, 'expense', 'transportation', 'Credit Card'),
  (uid, '2026-01-22', 'Parqueadero oficina mensual parcial',           45000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-01-28', 'Uber aeropuerto regreso',                       42000, 'expense', 'transportation', 'Credit Card'),
  (uid, '2026-01-10', 'Panamericana cuadernos y papelería',            48000, 'expense', 'shopping',       'Cash'),
  (uid, '2026-01-23', 'Alkosto cargador rápido celular',               65000, 'expense', 'shopping',       'Debit Card'),
  (uid, '2026-01-20', 'Droguería La Rebaja suplementos',               58000, 'expense', 'healthcare',     'Cash'),
  (uid, '2026-01-30', 'Laboratorio clínico exámenes',                 120000, 'expense', 'healthcare',     'Debit Card'),
  (uid, '2026-01-15', 'Administración conjunto residencial',          180000, 'expense', 'utilities',      'Bank Transfer'),
  (uid, '2026-01-09', 'Lavandería ropa formal',                        28000, 'expense', 'other',          'Cash'),
  (uid, '2026-01-16', 'Peluquería corte de cabello',                   35000, 'expense', 'other',          'Cash'),
  (uid, '2026-01-21', 'Tintorería chaqueta',                           22000, 'expense', 'other',          'Cash'),
  (uid, '2026-01-25', 'Donación fundación animal',                     50000, 'expense', 'other',          'Bank Transfer'),
  (uid, '2026-01-07', 'Almuerzo corriente restaurante',                15000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-01-10', 'Almuerzo corriente restaurante',                15000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-01-20', 'Almuerzo corriente restaurante',                16000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-01-23', 'Almuerzo corriente restaurante',                15000, 'expense', 'groceries',      'Cash');

-- FEBRUARY additional (~25 more)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-02-02', 'Panadería Masa desayuno familiar',              25000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-02-09', 'Café Oma granos premium',                       42000, 'expense', 'groceries',      'Debit Card'),
  (uid, '2026-02-16', 'Helados Mimo postre domingo',                   18000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-02-23', 'Almuerzo corriente restaurante',                16000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-02-03', 'Almuerzo corriente restaurante',                15000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-02-06', 'Almuerzo corriente restaurante',                15000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-02-12', 'Almuerzo corriente restaurante',                16000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-02-19', 'Almuerzo corriente restaurante',                15000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-02-07', 'Cervecería BBC con amigos',                     85000, 'expense', 'entertainment',  'Credit Card'),
  (uid, '2026-02-15', 'Hamburguesería El Corral delivery',             52000, 'expense', 'entertainment',  'Credit Card'),
  (uid, '2026-02-22', 'Billar y tragos Chapinero',                     68000, 'expense', 'entertainment',  'Cash'),
  (uid, '2026-02-04', 'Parqueadero centro comercial',                   10000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-02-11', 'Rappi envío restaurante',                        8000, 'expense', 'transportation', 'Credit Card'),
  (uid, '2026-02-16', 'Uber trayecto fiesta',                          25000, 'expense', 'transportation', 'Credit Card'),
  (uid, '2026-02-22', 'Parqueadero zona T',                            15000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-02-08', 'Librería Nacional libro programación',          95000, 'expense', 'shopping',       'Credit Card'),
  (uid, '2026-02-17', 'Decathlon banda elástica ejercicio',            45000, 'expense', 'shopping',       'Debit Card'),
  (uid, '2026-02-12', 'Farmacia Cruz Verde analgésicos',               28000, 'expense', 'healthcare',     'Cash'),
  (uid, '2026-02-15', 'Administración conjunto residencial',          180000, 'expense', 'utilities',      'Bank Transfer'),
  (uid, '2026-02-07', 'Peluquería corte y barba',                      40000, 'expense', 'other',          'Cash'),
  (uid, '2026-02-13', 'Lavandería semanal',                            25000, 'expense', 'other',          'Cash'),
  (uid, '2026-02-19', 'Servicio técnico celular',                      85000, 'expense', 'other',          'Cash'),
  (uid, '2026-02-26', 'Veterinaria vacunas mascota',                  120000, 'expense', 'other',          'Debit Card'),
  (uid, '2026-02-27', 'Freelance corrección bugs cliente',            450000, 'income',  'freelance',      'Bank Transfer'),
  (uid, '2026-02-05', 'Venta mueble usado MercadoLibre',              180000, 'income',  'other',          'Bank Transfer');

-- MARCH additional (~20 more — partial month)
INSERT INTO transactions (user_id, date, description, amount, type, category_id, method) VALUES
  (uid, '2026-03-02', 'Panadería artesanal desayuno',                  22000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-03-06', 'Café Juan Valdez granos',                       38000, 'expense', 'groceries',      'Debit Card'),
  (uid, '2026-03-10', 'Almuerzo corriente restaurante',                16000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-03-13', 'Almuerzo corriente restaurante',                15000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-03-16', 'Almuerzo corriente restaurante',                16000, 'expense', 'groceries',      'Cash'),
  (uid, '2026-03-03', 'Hamburguesa artesanal El Garage',               48000, 'expense', 'entertainment',  'Credit Card'),
  (uid, '2026-03-07', 'Café con amigos Pergamino',                     35000, 'expense', 'entertainment',  'Cash'),
  (uid, '2026-03-14', 'Pizza Jenos delivery',                          45000, 'expense', 'entertainment',  'Credit Card'),
  (uid, '2026-03-03', 'Parqueadero centro comercial',                   12000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-03-07', 'Uber trayecto oficina',                         18000, 'expense', 'transportation', 'Credit Card'),
  (uid, '2026-03-11', 'Rappi envío farmacia',                           9000, 'expense', 'transportation', 'Credit Card'),
  (uid, '2026-03-15', 'Parqueadero zona G',                            14000, 'expense', 'transportation', 'Cash'),
  (uid, '2026-03-05', 'Librería Panamericana agenda 2026',             38000, 'expense', 'shopping',       'Cash'),
  (uid, '2026-03-12', 'MercadoLibre protector pantalla',               25000, 'expense', 'shopping',       'Credit Card'),
  (uid, '2026-03-15', 'Administración conjunto residencial',          180000, 'expense', 'utilities',      'Bank Transfer'),
  (uid, '2026-03-06', 'Peluquería corte de cabello',                   35000, 'expense', 'other',          'Cash'),
  (uid, '2026-03-10', 'Lavandería ropa',                               22000, 'expense', 'other',          'Cash'),
  (uid, '2026-03-14', 'Donación Cruz Roja',                            30000, 'expense', 'other',          'Bank Transfer'),
  (uid, '2026-03-15', 'Farmacia Pasteur protector solar',              42000, 'expense', 'healthcare',     'Cash'),
  (uid, '2026-03-08', 'Freelance logo diseño gráfico',                600000, 'income',  'freelance',      'Bank Transfer');

-- =============================================================================
-- 6. USER FINANCIAL MEMORY (1 row, upsert)
-- =============================================================================
INSERT INTO user_financial_memory (user_id, memory)
VALUES (
  uid,
  '{
    "profile": {
      "locale": "es-CO",
      "currency": "COP",
      "occupation": "Desarrollador de software senior",
      "employer": "TechCol SAS",
      "income_sources": ["salary", "freelance"],
      "monthly_net_salary": 6400000,
      "avg_freelance_monthly": 900000
    },
    "spending_habits": {
      "top_categories": ["rent", "groceries", "transportation"],
      "preferred_stores": ["Éxito", "D1", "Carulla", "Jumbo"],
      "payment_preference": "Debit Card for daily, Credit Card for large purchases",
      "impulse_spending_risk": "medium - electronics and dining out"
    },
    "goals": [
      {
        "name": "Pagar tarjeta Nu Colombia",
        "type": "debt-payoff",
        "target_date": "2026-09-01",
        "priority": "high"
      },
      {
        "name": "Fondo de emergencia 3 meses",
        "type": "emergency-fund",
        "target_amount": 15000000,
        "current_amount": 4200000,
        "priority": "high"
      },
      {
        "name": "Vacaciones San Andrés",
        "type": "savings",
        "target_amount": 5000000,
        "current_amount": 1200000,
        "target_date": "2026-12-01",
        "priority": "medium"
      }
    ],
    "risk_tolerance": "moderate",
    "financial_literacy": "intermediate",
    "notes": "Prefiere consejos en español. Interesado en inversión en CDTs y fondos de inversión colectiva."
  }'::jsonb
)
ON CONFLICT (user_id)
DO UPDATE SET
  memory = EXCLUDED.memory,
  updated_at = now();

-- =============================================================================
-- 7. CHAT SUMMARIES (3 rows)
-- =============================================================================
INSERT INTO chat_summaries (user_id, summary, topics, actions_taken, message_count, created_at) VALUES
(
  uid,
  'El usuario pidió ayuda para optimizar su presupuesto mensual. Se identificaron oportunidades de ahorro en entretenimiento y compras. Se sugirió reducir gastos en restaurantes y redirigir ese dinero al fondo de emergencia.',
  ARRAY['presupuesto', 'ahorro', 'optimización de gastos'],
  ARRAY['{"action": "budget_review", "details": "Revisión completa de presupuesto enero 2026"}'::jsonb, '{"action": "savings_suggestion", "details": "Sugerencia de reducir entretenimiento en 100K COP/mes"}'::jsonb],
  12,
  '2026-01-15 14:30:00-05'
),
(
  uid,
  'Conversación sobre estrategia de pago de deudas. Se compararon métodos avalancha vs bola de nieve. El usuario decidió priorizar la tarjeta Nu Colombia por su alta tasa de interés (28.5% APR). Se creó un plan de pagos acelerado.',
  ARRAY['deudas', 'estrategia de pago', 'tarjeta de crédito', 'método avalancha'],
  ARRAY['{"action": "debt_analysis", "details": "Análisis comparativo de 4 deudas activas"}'::jsonb, '{"action": "payment_plan", "details": "Plan de pago acelerado para Tarjeta Nu - meta septiembre 2026"}'::jsonb, '{"action": "savings_redirect", "details": "Redirigir 150K COP extras mensuales al pago de Nu"}'::jsonb],
  18,
  '2026-02-08 10:15:00-05'
),
(
  uid,
  'El usuario consultó sobre cómo diversificar sus ingresos freelance. Se discutieron plataformas como Toptal y Workana. También se habló sobre abrir un CDT en Bancolombia con los ahorros acumulados.',
  ARRAY['ingresos', 'freelance', 'diversificación', 'inversión', 'CDT'],
  ARRAY['{"action": "income_analysis", "details": "Análisis de ingresos freelance vs salario - freelance representa 12% del ingreso total"}'::jsonb],
  8,
  '2026-03-05 16:45:00-05'
);

END $$;

COMMIT;
