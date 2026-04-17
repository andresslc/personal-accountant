/**
 * Reference benchmark: Colombian household with ~8,000,000 COP/month gross income.
 *
 * Purpose: give AI agents, predictions, and insights a grounded baseline to
 * compare a user's real spending against "typical" patterns for their income
 * bracket. NOT used as user-facing mock data — see `lib/mocks/` for that.
 *
 * Source mix: DANE ENPH/IPC, Superfinanciera de Colombia (usury rate and
 * product rates), Banco de la República stability reports, Asobancaria.
 * Figures are rounded benchmarks, not a personal forecast.
 */

export interface SpendingCategoryBenchmark {
  id: string
  name: string
  nameEs: string
  percentOfNet: number
  monthlyCOP: number
  annualCOP: number
  drivers: string[]
}

export interface MonthlyFlowPoint {
  month: string
  monthEs: string
  incomeCOP: number
  expensesCOP: number
  savingsCOP: number
  note?: string
}

export interface CreditCardBenchmark {
  issuer: string
  product: string
  monthlyFeeCOP: number
  annualFeeCOP: number
  typicalAprEA: number
  notes: string
}

export type LoanProductType =
  | 'libranza'
  | 'libre-inversion'
  | 'vehiculo'
  | 'hipotecario'
  | 'leasing-habitacional'
  | 'educativo'
  | 'compra-cartera'
  | 'bnpl'

export interface LoanProductBenchmark {
  type: LoanProductType
  name: string
  nameEs: string
  termMonthsMin: number
  termMonthsMax: number
  aprEaMin: number
  aprEaMax: number
  typicalAmountMinCOP: number
  typicalAmountMaxCOP: number
  notes: string
}

export interface DebtScenarioItem {
  product: string
  balanceCOP: number
  aprEA: number
  termMonths: number
  monthlyPaymentCOP: number
  annualPaymentCOP: number
}

export interface DebtScenario {
  name: string
  description: string
  items: DebtScenarioItem[]
  totalMonthlyCOP: number
  totalAnnualCOP: number
  debtServiceRatio: number
}

export interface ColombianHouseholdBenchmark {
  metadata: {
    country: 'CO'
    currency: 'COP'
    profile: string
    estrato: string
    grossMonthlyIncomeCOP: number
    netMonthlyIncomeCOP: number
    netMonthlyIncomeLowCOP: number
    netMonthlyIncomeHighCOP: number
    annualGrossIncomeCOP: number
    annualNetIncomeCOP: number
    primaFactor: number
    percentileRank: string
    lastUpdated: string
    sources: string[]
  }
  categories: SpendingCategoryBenchmark[]
  monthlyFlow: MonthlyFlowPoint[]
  creditCards: CreditCardBenchmark[]
  loans: LoanProductBenchmark[]
  debtScenarios: DebtScenario[]
  usuryRate: {
    effectiveAnnual: number
    asOf: string
    source: string
  }
  observations: string[]
}

const NET = 6_800_000

export const colombianHousehold8M: ColombianHouseholdBenchmark = {
  metadata: {
    country: 'CO',
    currency: 'COP',
    profile:
      'Urban salaried household (Bogotá / Medellín / Cali), 1–2 adults, possibly 1 child, gross income 8,000,000 COP/month.',
    estrato: '4–5',
    grossMonthlyIncomeCOP: 8_000_000,
    netMonthlyIncomeCOP: NET,
    netMonthlyIncomeLowCOP: 6_400_000,
    netMonthlyIncomeHighCOP: 6_800_000,
    annualGrossIncomeCOP: 96_000_000,
    annualNetIncomeCOP: 93_900_000,
    primaFactor: 2,
    percentileRank: 'Top 15–20% of Colombian earners (DANE GEIH).',
    lastUpdated: '2026-04-16',
    sources: [
      'DANE — Encuesta Nacional de Presupuestos de los Hogares (ENPH)',
      'DANE — IPC monthly bulletins',
      'Superintendencia Financiera de Colombia — tasas de colocación y usura',
      'Banco de la República — informes de estabilidad financiera',
      'Asobancaria — informes semanales',
    ],
  },

  categories: [
    {
      id: 'vivienda',
      name: 'Housing',
      nameEs: 'Vivienda',
      percentOfNet: 28,
      monthlyCOP: 1_904_000,
      annualCOP: 22_848_000,
      drivers: [
        'Arriendo o cuota hipotecaria (1,200,000–2,500,000)',
        'Administración (250,000–500,000)',
        'Servicios públicos: luz, agua, gas, internet (350,000–550,000)',
      ],
    },
    {
      id: 'alimentos-hogar',
      name: 'Groceries',
      nameEs: 'Alimentos (hogar)',
      percentOfNet: 13,
      monthlyCOP: 884_000,
      annualCOP: 10_608_000,
      drivers: ['Mercado quincenal en Éxito, D1, Ara, Jumbo, Carulla'],
    },
    {
      id: 'restaurantes-domicilios',
      name: 'Restaurants & delivery',
      nameEs: 'Restaurantes y domicilios',
      percentOfNet: 5,
      monthlyCOP: 340_000,
      annualCOP: 4_080_000,
      drivers: ['Rappi, iFood, DiDi Food, 2–4 pedidos por semana'],
    },
    {
      id: 'transporte',
      name: 'Transportation',
      nameEs: 'Transporte',
      percentOfNet: 10,
      monthlyCOP: 680_000,
      annualCOP: 8_160_000,
      drivers: [
        'TransMilenio / Metro / SITP (~180,000)',
        'Uber / DiDi / taxi',
        'Cuota de carro + gasolina + parqueadero si aplica',
      ],
    },
    {
      id: 'salud',
      name: 'Health',
      nameEs: 'Salud',
      percentOfNet: 4,
      monthlyCOP: 272_000,
      annualCOP: 3_264_000,
      drivers: [
        'Medicina prepagada Colsanitas / Sura (180,000–350,000 por persona)',
        'Gastos de bolsillo (medicamentos, copagos)',
      ],
    },
    {
      id: 'educacion',
      name: 'Education',
      nameEs: 'Educación',
      percentOfNet: 7,
      monthlyCOP: 476_000,
      annualCOP: 5_712_000,
      drivers: [
        'Pensión colegio o universidad privada',
        'Cursos y material educativo',
      ],
    },
    {
      id: 'vestuario-cuidado',
      name: 'Clothing & personal care',
      nameEs: 'Vestuario y cuidado personal',
      percentOfNet: 3,
      monthlyCOP: 204_000,
      annualCOP: 2_448_000,
      drivers: ['Ropa, peluquería, gimnasio, productos de cuidado'],
    },
    {
      id: 'entretenimiento',
      name: 'Entertainment',
      nameEs: 'Entretenimiento y ocio',
      percentOfNet: 4,
      monthlyCOP: 272_000,
      annualCOP: 3_264_000,
      drivers: ['Netflix, Disney+, Spotify (~90,000)', 'Cine, planes'],
    },
    {
      id: 'tecnologia',
      name: 'Technology & communications',
      nameEs: 'Tecnología y comunicaciones',
      percentOfNet: 2,
      monthlyCOP: 136_000,
      annualCOP: 1_632_000,
      drivers: ['Plan celular', 'Apps y software'],
    },
    {
      id: 'seguros',
      name: 'Insurance',
      nameEs: 'Seguros',
      percentOfNet: 3,
      monthlyCOP: 204_000,
      annualCOP: 2_448_000,
      drivers: ['SOAT', 'Póliza todo riesgo vehículo', 'Seguro de vida'],
    },
    {
      id: 'deuda',
      name: 'Debt service',
      nameEs: 'Cuotas de deuda',
      percentOfNet: 13,
      monthlyCOP: 884_000,
      annualCOP: 10_608_000,
      drivers: [
        'Pago mínimo tarjeta(s) de crédito',
        'Cuota libre inversión / libranza',
        'BNPL: Addi, Sistecrédito',
      ],
    },
    {
      id: 'ahorro',
      name: 'Savings & investment',
      nameEs: 'Ahorro e inversión',
      percentOfNet: 6,
      monthlyCOP: 408_000,
      annualCOP: 4_896_000,
      drivers: ['CDT, fondos Bancolombia / Davivienda', 'Trii, dólares'],
    },
    {
      id: 'imprevistos',
      name: 'Other & contingencies',
      nameEs: 'Imprevistos y otros',
      percentOfNet: 2,
      monthlyCOP: 136_000,
      annualCOP: 1_632_000,
      drivers: ['Regalos, viajes cortos, gastos inesperados'],
    },
  ],

  monthlyFlow: [
    { month: 'Jan', monthEs: 'Ene', incomeCOP: 6_700_000, expensesCOP: 6_200_000, savingsCOP: 500_000, note: 'Post-diciembre, gasto bajo' },
    { month: 'Feb', monthEs: 'Feb', incomeCOP: 6_700_000, expensesCOP: 6_400_000, savingsCOP: 300_000 },
    { month: 'Mar', monthEs: 'Mar', incomeCOP: 6_700_000, expensesCOP: 6_400_000, savingsCOP: 300_000 },
    { month: 'Apr', monthEs: 'Abr', incomeCOP: 6_700_000, expensesCOP: 6_300_000, savingsCOP: 400_000 },
    { month: 'May', monthEs: 'May', incomeCOP: 6_700_000, expensesCOP: 6_500_000, savingsCOP: 200_000 },
    { month: 'Jun', monthEs: 'Jun', incomeCOP: 13_400_000, expensesCOP: 6_600_000, savingsCOP: 6_800_000, note: 'Prima de servicios' },
    { month: 'Jul', monthEs: 'Jul', incomeCOP: 6_700_000, expensesCOP: 7_100_000, savingsCOP: -400_000, note: 'Vacaciones mitad de año' },
    { month: 'Aug', monthEs: 'Ago', incomeCOP: 6_700_000, expensesCOP: 6_500_000, savingsCOP: 200_000 },
    { month: 'Sep', monthEs: 'Sep', incomeCOP: 6_700_000, expensesCOP: 6_400_000, savingsCOP: 300_000 },
    { month: 'Oct', monthEs: 'Oct', incomeCOP: 6_700_000, expensesCOP: 6_600_000, savingsCOP: 100_000 },
    { month: 'Nov', monthEs: 'Nov', incomeCOP: 6_700_000, expensesCOP: 6_600_000, savingsCOP: 100_000 },
    { month: 'Dec', monthEs: 'Dic', incomeCOP: 13_500_000, expensesCOP: 8_000_000, savingsCOP: 5_500_000, note: 'Prima + aguinaldo, regalos y fin de año' },
  ],

  creditCards: [
    { issuer: 'Bancolombia', product: 'Visa / Mastercard Gold / Platinum / Amex', monthlyFeeCOP: 40_000, annualFeeCOP: 480_000, typicalAprEA: 26, notes: 'Emisor dominante en Colombia. A la Mano es billetera, no tarjeta de crédito.' },
    { issuer: 'Davivienda', product: 'Clásica / Gold / Platinum', monthlyFeeCOP: 30_000, annualFeeCOP: 360_000, typicalAprEA: 26, notes: 'Se integra con DaviPlata.' },
    { issuer: 'BBVA', product: 'Aqua / Gold / Platinum', monthlyFeeCOP: 35_000, annualFeeCOP: 420_000, typicalAprEA: 26, notes: 'Aqua usa CVV dinámico.' },
    { issuer: 'Banco de Bogotá (Grupo Aval)', product: 'Visa / Mastercard', monthlyFeeCOP: 35_000, annualFeeCOP: 420_000, typicalAprEA: 26, notes: 'Común entre empleados públicos y libranza.' },
    { issuer: 'Scotiabank Colpatria', product: 'Mastercard / Amex', monthlyFeeCOP: 40_000, annualFeeCOP: 480_000, typicalAprEA: 26, notes: 'Alianzas con cine y viajes.' },
    { issuer: 'Banco Falabella', product: 'CMR Visa', monthlyFeeCOP: 20_000, annualFeeCOP: 240_000, typicalAprEA: 26, notes: 'Descuentos en Falabella, Homecenter, Sodimac.' },
    { issuer: 'Tuya (Grupo Éxito)', product: 'Éxito Mastercard / Carulla', monthlyFeeCOP: 18_000, annualFeeCOP: 216_000, typicalAprEA: 26, notes: 'Genera puntos Éxito; alta penetración estratos 3–5.' },
    { issuer: 'Nu Colombia', product: 'Mastercard morada', monthlyFeeCOP: 0, annualFeeCOP: 0, typicalAprEA: 24, notes: 'Sin cuota de manejo; app-only. Crecimiento acelerado 2023–2026.' },
    { issuer: 'RappiCard (Davivienda)', product: 'RappiCard Visa', monthlyFeeCOP: 0, annualFeeCOP: 0, typicalAprEA: 24, notes: 'Cashback en Rappi. Cuota de manejo exonerada el primer año.' },
  ],

  loans: [
    { type: 'libranza', name: 'Libranza (payroll-deducted loan)', nameEs: 'Libranza', termMonthsMin: 24, termMonthsMax: 96, aprEaMin: 15, aprEaMax: 19, typicalAmountMinCOP: 10_000_000, typicalAmountMaxCOP: 80_000_000, notes: 'Más barato por bajo riesgo de impago; requiere convenio del empleador. Ofrecido por Banco Popular, Davivienda, Bancolombia, cooperativas (Confiar, Cootrafa).' },
    { type: 'libre-inversion', name: 'General-purpose personal loan', nameEs: 'Libre inversión', termMonthsMin: 12, termMonthsMax: 60, aprEaMin: 18, aprEaMax: 24, typicalAmountMinCOP: 5_000_000, typicalAmountMaxCOP: 40_000_000, notes: 'Sin destino específico. Ofrecido por todos los bancos grandes y fintechs (Lineru, RapiCredit).' },
    { type: 'vehiculo', name: 'Auto loan', nameEs: 'Crédito de vehículo', termMonthsMin: 36, termMonthsMax: 72, aprEaMin: 14, aprEaMax: 19, typicalAmountMinCOP: 30_000_000, typicalAmountMaxCOP: 120_000_000, notes: 'Cuota inicial típica 20–30%. El vehículo queda en prenda.' },
    { type: 'hipotecario', name: 'Mortgage', nameEs: 'Crédito hipotecario', termMonthsMin: 120, termMonthsMax: 240, aprEaMin: 10, aprEaMax: 14, typicalAmountMinCOP: 100_000_000, typicalAmountMaxCOP: 400_000_000, notes: 'Tasa fija o UVR + 6–9 puntos. Cuota típicamente limitada al 30% del ingreso familiar. FNA disponible para empleados.' },
    { type: 'leasing-habitacional', name: 'Housing lease', nameEs: 'Leasing habitacional', termMonthsMin: 180, termMonthsMax: 240, aprEaMin: 10, aprEaMax: 13, typicalAmountMinCOP: 100_000_000, typicalAmountMaxCOP: 400_000_000, notes: 'Alternativa fiscal al hipotecario; el banco es propietario hasta el cierre.' },
    { type: 'educativo', name: 'Education loan', nameEs: 'Crédito educativo', termMonthsMin: 60, termMonthsMax: 120, aprEaMin: 7, aprEaMax: 15, typicalAmountMinCOP: 10_000_000, typicalAmountMaxCOP: 80_000_000, notes: 'ICETEX (tasa subsidiada con gracia), Sufi, Pichincha.' },
    { type: 'compra-cartera', name: 'Debt consolidation loan', nameEs: 'Compra de cartera', termMonthsMin: 36, termMonthsMax: 60, aprEaMin: 16, aprEaMax: 20, typicalAmountMinCOP: 5_000_000, typicalAmountMaxCOP: 80_000_000, notes: 'Consolida saldos de tarjetas a tasa menor.' },
    { type: 'bnpl', name: 'Buy Now, Pay Later', nameEs: 'Compra ahora, paga después', termMonthsMin: 1, termMonthsMax: 24, aprEaMin: 0, aprEaMax: 22, typicalAmountMinCOP: 100_000, typicalAmountMaxCOP: 5_000_000, notes: 'Addi, Sistecrédito, Mercado Crédito. Alta penetración en retail.' },
  ],

  debtScenarios: [
    {
      name: 'Prudent profile (recommended ≤ 30% DTI)',
      description: 'Hipoteca + una tarjeta con saldo rotativo moderado. Sostenible para este ingreso.',
      items: [
        { product: 'Crédito hipotecario (apto 250M, 15 años, 12% E.A.)', balanceCOP: 250_000_000, aprEA: 12, termMonths: 180, monthlyPaymentCOP: 3_000_000, annualPaymentCOP: 36_000_000 },
        { product: 'Tarjeta Bancolombia (saldo rotativo 4M a 24% E.A.)', balanceCOP: 4_000_000, aprEA: 24, termMonths: 12, monthlyPaymentCOP: 400_000, annualPaymentCOP: 4_800_000 },
      ],
      totalMonthlyCOP: 3_400_000,
      totalAnnualCOP: 40_800_000,
      debtServiceRatio: 0.5,
    },
    {
      name: 'Stretched profile',
      description: 'Hipoteca + crédito de vehículo + saldo rotativo en tarjeta. Cerca del límite saludable.',
      items: [
        { product: 'Crédito hipotecario (250M, 15 años, 12% E.A.)', balanceCOP: 250_000_000, aprEA: 12, termMonths: 180, monthlyPaymentCOP: 3_000_000, annualPaymentCOP: 36_000_000 },
        { product: 'Crédito de vehículo (50M, 5 años, 17% E.A.)', balanceCOP: 50_000_000, aprEA: 17, termMonths: 60, monthlyPaymentCOP: 1_240_000, annualPaymentCOP: 14_880_000 },
        { product: 'Tarjeta rotativa (4M, 24% E.A.)', balanceCOP: 4_000_000, aprEA: 24, termMonths: 12, monthlyPaymentCOP: 400_000, annualPaymentCOP: 4_800_000 },
        { product: 'BNPL Sistecrédito (1.5M)', balanceCOP: 1_500_000, aprEA: 20, termMonths: 10, monthlyPaymentCOP: 150_000, annualPaymentCOP: 1_800_000 },
      ],
      totalMonthlyCOP: 4_790_000,
      totalAnnualCOP: 57_480_000,
      debtServiceRatio: 0.7,
    },
    {
      name: 'Over-leveraged / warning profile',
      description: 'Mismo perfil anterior más libre inversión. Más del 70% del ingreso neto va a servicio de deuda.',
      items: [
        { product: 'Crédito hipotecario (250M, 15 años, 12% E.A.)', balanceCOP: 250_000_000, aprEA: 12, termMonths: 180, monthlyPaymentCOP: 3_000_000, annualPaymentCOP: 36_000_000 },
        { product: 'Crédito de vehículo (50M, 5 años, 17% E.A.)', balanceCOP: 50_000_000, aprEA: 17, termMonths: 60, monthlyPaymentCOP: 1_240_000, annualPaymentCOP: 14_880_000 },
        { product: 'Libre inversión (20M, 3 años, 22% E.A.)', balanceCOP: 20_000_000, aprEA: 22, termMonths: 36, monthlyPaymentCOP: 770_000, annualPaymentCOP: 9_240_000 },
        { product: 'Tarjetas rotativas (7M, 25% E.A.)', balanceCOP: 7_000_000, aprEA: 25, termMonths: 12, monthlyPaymentCOP: 700_000, annualPaymentCOP: 8_400_000 },
      ],
      totalMonthlyCOP: 5_710_000,
      totalAnnualCOP: 68_520_000,
      debtServiceRatio: 0.84,
    },
  ],

  usuryRate: {
    effectiveAnnual: 26,
    asOf: '2026-Q1',
    source: 'Superintendencia Financiera de Colombia (certificación trimestral).',
  },

  observations: [
    'Biannual income spikes: primas de junio y diciembre distorsionan cualquier promedio mensual.',
    'IPC Colombia cerró 2025 cerca del 5% anual. Alimentos, arriendos y servicios públicos suelen crecer por encima del promedio.',
    'La combinación tarjeta rotativa + BNPL + libre inversión es la ruta más rápida a estrés financiero en este ingreso; tres productos cerca de la tasa de usura absorben 20–25% del neto.',
    'Billetera fragmentada: el usuario típico paga desde Bancolombia / Davivienda (débito), Nu / Rappi (crédito) y Nequi / Daviplata (P2P). Modelos de categorización deben deduplicar (ej. "recarga Nequi" no es gasto).',
    'BNPL suele ser invisible en extractos bancarios tradicionales — merece categoría propia en FinFlow.',
    'Hipoteca + vehículo típicamente representan 50–65% del servicio total de deuda; si existen ambos, la tarjeta rotativa debe mantenerse en cero.',
  ],
}

export function getColombianHousehold8MBenchmark(): ColombianHouseholdBenchmark {
  return colombianHousehold8M
}
