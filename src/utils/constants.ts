import type { Budget, BNPLPlan, RecurringTransaction, Goal, Debt } from '../types';

export const SEEDED: {
  debts: Debt[];
  bnpl: BNPLPlan[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  goals: Goal[];
} = {
  debts: [
    {"id":"x1-card","name":"X1 Card","balance":20306.98,"apr":26.99,"minPayment":350},
    {"id":"paypal-credit","name":"PayPal Credit","balance":4833.57,"apr":23.99,"minPayment":120},
    {"id":"discover","name":"Discover","balance":4071.14,"apr":25.99,"minPayment":100},
    {"id":"apple-card","name":"Apple Card","balance":6126.44,"apr":24.99,"minPayment":150},
    {"id":"advancial-visa","name":"Advancial Visa Signature","balance":5245.52,"apr":22.99,"minPayment":130},
    {"id":"adorama-edge","name":"Adorama Edge (Closed)","balance":1380.70,"apr":0,"minPayment":50},
    {"id":"google-store","name":"Google Store","balance":403.46,"apr":0,"minPayment":40},
    {"id":"costco-citi","name":"Costco Citi (Closed)","balance":4712.49,"apr":0,"minPayment":80},
    {"id":"paypal-paylater","name":"PayPal Pay Later","balance":1000.46,"apr":0,"minPayment":100},
    {"id":"klarna","name":"Klarna","balance":1161.84,"apr":0,"minPayment":100},
    {"id":"affirm","name":"Affirm Loan","balance":12000,"apr":9.99,"minPayment":350},
    {"id":"auto-loan","name":"Rogue CU Auto Loan","balance":35975.40,"apr":9.99,"minPayment":780}
  ],
  bnpl: [
    {"id":"bnpl-pp","provider":"PayPal","description":"PayPal Pay Later bundles","total":1000.46,"remaining":820.46,"dueDates":["2025-09-15","2025-10-15","2025-11-15"]},
    {"id":"bnpl-klarna","provider":"Klarna","description":"Klarna purchases","total":1161.84,"remaining":840.00,"dueDates":["2025-09-05","2025-09-19","2025-10-03","2025-10-17"]},
    {"id":"bnpl-affirm","provider":"Affirm","description":"Affirm 24-month","total":12000,"remaining":9800,"dueDates":["2025-09-12","2025-10-12","2025-11-12"]}
  ],
  budgets: [
    {"id":"b-housing","category":"Housing","allocated":1480,"spent":1480},
    {"id":"b-car","category":"Car","allocated":780,"spent":780},
    {"id":"b-dining","category":"Dining","allocated":400,"spent":400},
    {"id":"b-groceries","category":"Groceries","allocated":300,"spent":250},
    {"id":"b-debt","category":"Debt","allocated":1200,"spent":1200}
  ],
  recurring: [
    {"id":"r-base","name":"Base Pay","type":"income","amount":10000,"cadence":"monthly"},
    {"id":"r-rent","name":"Rent","type":"expense","amount":1480,"cadence":"monthly"},
    {"id":"r-car","name":"Car Payment","type":"expense","amount":780,"cadence":"monthly"},
    {"id":"r-groceries","name":"Groceries","type":"expense","amount":300,"cadence":"monthly"},
    {"id":"r-dining","name":"Dining","type":"expense","amount":400,"cadence":"monthly"},
    {"id":"r-internet","name":"Internet","type":"expense","amount":100,"cadence":"monthly"},
    {"id":"r-power","name":"Power","type":"expense","amount":180,"cadence":"monthly"},
    {"id":"r-insurance","name":"Insurance","type":"expense","amount":80,"cadence":"monthly"},
    {"id":"r-remittance","name":"Remittance (Family PH)","type":"expense","amount":1000,"cadence":"monthly"}
  ],
  goals: [
    {"id":"g-emergency","name":"Emergency Fund","target":5000,"current":0,"priority":5},
    {"id":"g-travel-phoenix","name":"Travel Fund (Phoenix 2025)","target":1500,"current":200,"due":"2025-08-31","priority":4},
    {"id":"g-europe","name":"Europe 2026","target":6000,"current":300,"due":"2026-07-01","priority":3}
  ]
};
