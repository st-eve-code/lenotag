export interface PolicySection {
  heading: string;
  body?: string[];
  list?: string[];
}

export interface Policy {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  image: string;
  intro: string[];
  sections: PolicySection[];
}

export const COMPANY_NAME =
  process.env.NEXT_PUBLIC_COMPANY_NAME || "lenotag";
export const COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Texas, USA";
export const COMPANY_NUMBER = process.env.NEXT_PUBLIC_COMPANY_NUMBER || "";
export const COMPANY_EMAIL = "support@nofacetrap.co.uk";
export const UPDATED = "October 2026";

const CONTACT: PolicySection = {
  heading: "Contact us",
  body: [
    `If you have any questions about this policy, please contact us at ${COMPANY_EMAIL}${
      COMPANY_NUMBER ? ` or in writing to ${COMPANY_ADDRESS}` : ""
    }.`,
  ],
};

export const policies: Policy[] = [
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    summary:
      "The terms that govern your use of our website and any order you place with us.",
    updated: UPDATED,
    image: "/policies/hero-terms.webp",
    intro: [
      `These Terms & Conditions ("Terms") govern your use of the ${COMPANY_NAME} website and any order you place with us. By using the site or placing an order you agree to these Terms.`,
      `We may update these Terms from time to time. The version in force is the one published on this page at the time you place your order.`,
    ],
    sections: [
      {
        heading: "About us",
        body: [
          `The website is operated by ${COMPANY_NAME}${
            COMPANY_NUMBER ? `, company number ${COMPANY_NUMBER}` : ""
          }${COMPANY_ADDRESS ? `, whose registered address is ${COMPANY_ADDRESS}` : ""}.`
        ],
      },
      {
        heading: "Eligibility and age verification",
        body: [
          "You must be 18 years of age or over to purchase from this website. All nicotine-containing products are age-restricted.",
          "By placing an order you confirm that you are 18 or over. We may request proof of age, and we will cancel and refund any order where age cannot be verified.",
        ],
      },
      {
        heading: "Products, nicotine and warnings",
        body: [
          "Nicotine is an addictive substance. Products containing nicotine are not intended for use by persons under 18, pregnant or breastfeeding women, or anyone who is not already a tobacco or nicotine user.",
          "Product images and descriptions are provided for guidance. Packaging and specifications may change without notice.",
        ],
        list: [
          "All our products comply with UK regulations, including the Tobacco and Related Products Regulations (TRPR).",
          "E-liquid bottles are limited to a maximum of 10ml and a nicotine strength of no more than 20mg/ml where required by law.",
          "We do not sell any product that makes medicinal claims or is presented as a licensed medicine.",
        ],
      },
      {
        heading: "Prices and payment",
        body: [
          "Prices are shown in British Pounds (GBP) and include VAT where applicable. We may change prices at any time, but changes will not affect orders we have already accepted.",
          "We accept the payment methods displayed at checkout. Payment is taken when you place your order.",
        ],
      },
      {
        heading: "Orders and acceptance",
        body: [
          "Your order is an offer to buy. A contract is only formed when we send you an order confirmation. We may decline an order for reasons including age verification, stock availability, pricing errors or suspected fraud.",
        ],
      },
      {
        heading: "Delivery",
        body: [
          "Delivery timescales are estimates and not guarantees. Age verification may be required on delivery. Further details are set out in our Delivery Information policy.",
        ],
      },
      {
        heading: "Returns, cancellations and faulty goods",
        body: [
          "Your statutory rights are not affected. Details of how to return an item, warranty cover and refund timing are set out in our Warranty & Returns policy.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "Nothing in these Terms limits our liability for death or personal injury caused by our negligence, fraud, or any liability that cannot be limited by law.",
          "Subject to that, we are not liable for losses that were not foreseeable, or for business losses such as loss of profit.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "All content on this website, including text, graphics and logos, is owned by us or licensed to us and may not be reproduced without permission.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These Terms are governed by the laws of England and Wales, and the courts of England and Wales have exclusive jurisdiction over any dispute.",
        ],
      },
      {
        heading: "Changes to these Terms",
        body: [
          "We may amend these Terms at any time by posting the updated version on this page. Please review it periodically.",
        ],
      },
      CONTACT,
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    summary:
      "How we collect, use, store and protect your personal data, and the rights you have.",
    updated: UPDATED,
    image: "/policies/hero-data.webp",
    intro: [
      `${COMPANY_NAME} respects your privacy and is committed to protecting your personal data. This policy explains how we handle your information when you use our website or make a purchase.`,
      "We are the data controller for the personal data described in this policy.",
    ],
    sections: [
      {
        heading: "Who we are",
        body: [
          `The data controller is ${COMPANY_NAME}${
            COMPANY_NUMBER ? ` (company number ${COMPANY_NUMBER})` : ""
          }${COMPANY_ADDRESS ? `, ${COMPANY_ADDRESS}` : ""}. You can contact us at ${COMPANY_EMAIL}.`
        ],
      },
      {
        heading: "Information we collect",
        list: [
          "Identity data such as your name, date of birth and age-verification information.",
          "Contact data such as your email address, phone number and delivery address.",
          "Transaction data such as the products you buy and payment status.",
          "Technical data such as your IP address, browser and device type.",
          "Usage data such as how you navigate our website.",
          "Marketing data such as your preferences for receiving offers.",
        ],
      },
      {
        heading: "How we use your information",
        list: [
          "To process and deliver your order, including age verification.",
          "To manage your account and provide customer support.",
          "To keep records of transactions and prevent fraud.",
          "To send marketing where you have agreed or where we have a lawful basis.",
          "To improve our website, products and services.",
        ],
      },
      {
        heading: "Lawful bases for processing",
        body: [
          "We rely on one or more of the following lawful bases: performance of a contract (to fulfil your order), legal obligation (age verification and tax records), legitimate interests (fraud prevention and service improvement), and consent (marketing and non-essential cookies).",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We use cookies and similar technologies. For more information see our Cookie Policy.",
        ],
      },
      {
        heading: "Sharing your information",
        body: [
          "We share data with trusted third parties who help us run our business, including payment processors, delivery partners, age-verification providers and IT service providers.",
          "We require all third parties to respect the security of your data and to treat it in accordance with the law. We do not sell your personal data.",
        ],
      },
      {
        heading: "International transfers",
        body: [
          "Where we transfer data outside the UK or EEA, we ensure a similar degree of protection by using approved safeguards such as the UK International Data Transfer Addendum or standard contractual clauses.",
        ],
      },
      {
        heading: "How long we keep your data",
        body: [
          "We keep your data only as long as necessary for the purposes we collected it, and to meet legal, accounting and reporting requirements. Order records are typically retained for six years.",
        ],
      },
      {
        heading: "Your rights",
        list: [
          "The right to access the personal data we hold about you.",
          "The right to request correction of inaccurate data.",
          "The right to request erasure of your data.",
          "The right to restrict or object to processing.",
          "The right to data portability.",
          "The right to withdraw consent at any time, where processing is based on consent.",
        ],
      },
      {
        heading: "Security",
        body: [
          "We use appropriate technical and organisational measures to protect your data. We limit access to those with a business need, and all staff with access are bound by confidentiality.",
        ],
      },
      {
        heading: "Complaints",
        body: [
          "You have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk. We would, however, appreciate the chance to deal with your concerns first.",
        ],
      },
      {
        heading: "Changes to this policy",
        body: [
          "We keep this policy under review and will post any updates on this page.",
        ],
      },
      CONTACT,
    ],
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    summary:
      "What cookies are, the cookies we use and how you can manage them.",
    updated: UPDATED,
    image: "/policies/hero-environment.webp",
    intro: [
      "This Cookie Policy explains how we use cookies and similar technologies on our website, why we use them, and how you can control them.",
    ],
    sections: [
      {
        heading: "What are cookies?",
        body: [
          "Cookies are small text files placed on your device when you visit a website. They help the site work, remember your preferences and understand how visitors use the site.",
        ],
      },
      {
        heading: "The cookies we use",
        list: [
          "Strictly necessary cookies: required for the website and checkout to function, such as keeping items in your basket and maintaining security.",
          "Performance and analytics cookies: help us understand how visitors use the site so we can improve it.",
          "Functionality cookies: remember choices you make, such as language or region.",
          "Targeting and advertising cookies: used to show relevant advertising and measure its effectiveness.",
        ],
      },
      {
        heading: "Third-party cookies",
        body: [
          "Some cookies are set by third parties that provide services on our behalf, such as analytics and payment providers. These third parties have their own privacy and cookie policies.",
        ],
      },
      {
        heading: "Managing cookies",
        body: [
          "You can set or amend your browser controls to accept or refuse cookies. If you disable cookies, parts of the website, including the checkout, may not work.",
          "You can also manage your preferences through the cookie banner or consent tool shown on the site.",
        ],
      },
      {
        heading: "Changes to this policy",
        body: [
          "We may update this policy as our use of cookies changes. Please check this page regularly.",
        ],
      },
      CONTACT,
    ],
  },
  {
    slug: "age-verification",
    title: "Age Verification Policy",
    summary: "Why we verify age, when it happens and how the process works.",
    updated: UPDATED,
    image: "/policies/hero-quality.webp",
    intro: [
      "We are committed to preventing the sale of age-restricted products to anyone under the age of 18. This policy explains how we verify age and what to expect.",
    ],
    sections: [
      {
        heading: "The law",
        body: [
          "It is illegal to sell nicotine-containing products, e-cigarettes and vaping devices to anyone under 18 in the UK. Our obligations arise under the Children and Families Act 2014 and the Tobacco and Related Products Regulations 2016 (TRPR).",
        ],
      },
      {
        heading: "When we verify age",
        list: [
          "When you create an account or place an order.",
          "Before dispatch of any age-restricted product.",
          "At the point of delivery, where our courier is required to confirm age.",
        ],
      },
      {
        heading: "How we verify age",
        body: [
          "We use trusted age-verification and payment providers to confirm that you are 18 or over. This may include checking the details you provide against available records and asking for photographic identification.",
        ],
      },
      {
        heading: "Identification we accept",
        list: [
          "A valid passport.",
          "A UK or EEA photo driving licence.",
          "A PASS-accredited proof-of-age card.",
        ],
      },
      {
        heading: "If verification fails",
        body: [
          "If we are unable to verify your age, we will cancel your order and refund any payment taken. We may be unable to process future orders from the same details.",
        ],
      },
      {
        heading: "Delivery and proof of age",
        body: [
          "Age-restricted orders must be received by a person aged 18 or over. Our delivery partners may request proof of age on the doorstep and will not leave restricted goods unattended.",
        ],
      },
      {
        heading: "Data protection",
        body: [
          "Any personal data provided for age verification is processed in line with our Privacy Policy and used only for the purpose of verifying age and complying with the law.",
        ],
      },
      CONTACT,
    ],
  },
  {
    slug: "direct-marketing-policy",
    title: "Direct Marketing Policy",
    summary:
      "How we use your details to send marketing, and how to opt in or out.",
    updated: UPDATED,
    image: "/policies/hero-newsletter.webp",
    intro: [
      "This policy explains how we carry out direct marketing and how you can control the messages you receive from us.",
    ],
    sections: [
      {
        heading: "Our approach",
        body: [
          "We only send direct marketing in line with data protection law, including the UK GDPR and the Privacy and Electronic Communications Regulations (PECR). We never send marketing to anyone we know to be under 18.",
        ],
      },
      {
        heading: "How we obtain consent",
        body: [
          "We ask for your consent when you sign up to our newsletter, create an account or tick a marketing box at checkout. You may also receive marketing where we have a legitimate interest, for example under the soft opt-in rules for existing customers.",
        ],
      },
      {
        heading: "Channels we use",
        list: [
          "Email newsletters and one-off campaigns.",
          "Occasional SMS messages where you have provided a mobile number and consent.",
          "Personalised on-site recommendations based on your browsing.",
        ],
      },
      {
        heading: "The soft opt-in",
        body: [
          "If you have bought from us before, we may contact you with similar offers using the details you provided, provided you were given a way to opt out at the time and in every message afterwards.",
        ],
      },
      {
        heading: "Opting out",
        body: [
          "Every marketing email includes an unsubscribe link. You can also update your preferences in your account or contact us and we will stop sending marketing. Opting out of marketing does not affect service messages about your orders.",
        ],
      },
      {
        heading: "Sharing with third parties",
        body: [
          "We do not sell your data. We may use trusted marketing service providers who process data on our behalf under contract.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You have the right to object to direct marketing at any time. See our Privacy Policy for more information about your rights.",
        ],
      },
      CONTACT,
    ],
  },
  {
    slug: "pecr-policy",
    title: "PECR Policy",
    summary:
      "Our approach to electronic communications and cookies under the PECR.",
    updated: UPDATED,
    image: "/policies/hero-privacy.webp",
    intro: [
      "The Privacy and Electronic Communications Regulations (PECR) sit alongside the UK GDPR and set rules for electronic marketing, cookies and communications privacy. This policy explains our approach.",
    ],
    sections: [
      {
        heading: "What PECR covers",
        list: [
          "Marketing by electronic means, including email, SMS and phone.",
          "The use of cookies and similar technologies.",
          "The security of communication services and customer traffic data.",
        ],
      },
      {
        heading: "Relationship with the UK GDPR",
        body: [
          "PECR complements the UK GDPR. Where consent is required for electronic marketing or cookies, we obtain consent that meets the UK GDPR standard: freely given, specific, informed and unambiguous.",
        ],
      },
      {
        heading: "Marketing emails and SMS",
        body: [
          "We send electronic marketing only to those who have consented, or to existing customers under the soft opt-in, and every message offers a simple way to unsubscribe.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We place non-essential cookies only after obtaining consent. Strictly necessary cookies are used without consent as permitted by PECR. See our Cookie Policy for details.",
        ],
      },
      {
        heading: "Telephone marketing",
        body: [
          "We screen any telephone marketing against the Telephone Preference Service (TPS) and Corporate TPS, and we do not make unsolicited marketing calls to registered numbers.",
        ],
      },
      {
        heading: "Record keeping",
        body: [
          "We keep records of consent and opt-outs so we can demonstrate compliance and honour your choices.",
        ],
      },
      CONTACT,
    ],
  },
  {
    slug: "environment-policy",
    title: "Environment Policy",
    summary:
      "Our commitments to reduce waste, recycle responsibly and lower our environmental impact.",
    updated: UPDATED,
    image: "/policies/hero-environment.webp",
    intro: [
      `${COMPANY_NAME} recognises its responsibility to reduce its environmental impact and to operate in a sustainable way. This policy sets out our commitments.`,
    ],
    sections: [
      {
        heading: "Our commitment",
        body: [
          "We are committed to complying with all applicable environmental legislation and to continually improving our environmental performance.",
        ],
      },
      {
        heading: "Packaging and recycling",
        list: [
          "We use recyclable and where possible recycled packaging.",
          "We keep packaging to the minimum needed to protect your goods.",
          "We encourage customers to recycle packaging and devices responsibly.",
        ],
      },
      {
        heading: "Waste electrical and electronic equipment (WEEE)",
        body: [
          "Vaping devices and batteries must not be disposed of in household waste. We support the take-back of WEEE and batteries and can advise on your nearest recycling point.",
        ],
      },
      {
        heading: "Energy and logistics",
        body: [
          "We look to reduce energy use in our operations and to work with delivery partners who share our commitment to lower-emission logistics.",
        ],
      },
      {
        heading: "Supply chain",
        body: [
          "We seek to work with suppliers who comply with environmental and product-safety law, and we encourage sustainable practices throughout our supply chain.",
        ],
      },
      {
        heading: "Compliance and standards",
        body: [
          "We comply with the WEEE Regulations, the Restriction of Hazardous Substances (RoHS) Regulations and UK packaging producer-responsibility obligations.",
        ],
      },
      {
        heading: "Responsibility and review",
        body: [
          "Management is responsible for implementing this policy, which is reviewed regularly to ensure it remains relevant and effective.",
        ],
      },
      CONTACT,
    ],
  },
  {
    slug: "quality-policy",
    title: "Quality Policy",
    summary:
      "Our commitment to genuine products, product safety and consistent customer service.",
    updated: UPDATED,
    image: "/policies/hero-quality.webp",
    intro: [
      `${COMPANY_NAME} is committed to supplying genuine, compliant products and to delivering a consistently high standard of service. This policy explains how we meet that commitment.`,
    ],
    sections: [
      {
        heading: "Our commitment",
        body: [
          "We aim to provide products that meet the expectations of our customers and comply with all relevant UK product-safety and consumer-protection legislation.",
        ],
      },
      {
        heading: "Authentic products and sourcing",
        list: [
          "We source stock from authorised distributors and reputable suppliers.",
          "We take steps to guard against counterfeit or non-compliant products.",
          "Products are checked against UK regulatory requirements before sale.",
        ],
      },
      {
        heading: "Product compliance",
        body: [
          "Our products comply with the Tobacco and Related Products Regulations (TRPR) and relevant safety standards. We do not sell nicotine products that make medicinal claims or that are presented as licensed medicines.",
        ],
      },
      {
        heading: "Storage and handling",
        body: [
          "Products are stored and handled in line with manufacturers' guidance to preserve quality and safety, including correct handling of batteries and e-liquids.",
        ],
      },
      {
        heading: "Customer service standards",
        body: [
          "We aim to respond to enquiries promptly, to resolve problems fairly and to handle every complaint in line with our policies.",
        ],
      },
      {
        heading: "Complaints and recalls",
        body: [
          "We keep records of quality issues and complaints, investigate them, and cooperate fully with any product recall or safety notice issued by a manufacturer or regulator.",
        ],
      },
      {
        heading: "Continuous improvement",
        body: [
          "We review feedback and quality data to improve our products and services on an ongoing basis.",
        ],
      },
      {
        heading: "Responsibility and review",
        body: [
          "Management is responsible for implementing this policy, which is reviewed regularly.",
        ],
      },
      CONTACT,
    ],
  },
  {
    slug: "warranty-and-returns",
    title: "Warranty & Returns",
    summary:
      "Faulty items, warranty cover, change-of-mind returns and how to send goods back.",
    updated: UPDATED,
    image: "/policies/hero-data.webp",
    intro: [
      "This policy explains your rights when goods are faulty, how warranty cover works, and how to return items you no longer want. It does not affect your statutory rights.",
    ],
    sections: [
      {
        heading: "Your statutory rights",
        body: [
          "Under the Consumer Rights Act 2015, goods must be of satisfactory quality, fit for purpose and as described. If they are not, you are entitled to a remedy.",
        ],
      },
      {
        heading: "Change of mind (14-day returns)",
        body: [
          "You may cancel an order within 14 days of receiving it and return unwanted items for a refund, provided they are unused, in their original packaging and with any seals intact.",
          "For hygiene and safety reasons, opened e-liquids, coils, pods and disposable vapes cannot be returned unless faulty.",
        ],
      },
      {
        heading: "Faulty goods",
        list: [
          "If a fault appears within 30 days of delivery, you can choose a refund or replacement.",
          "After 30 days and within six months, we will repair or replace the item, or refund you if that is not possible.",
          "After six months, you may still have rights if you can show the fault was present at delivery.",
        ],
      },
      {
        heading: "Dead on arrival",
        body: [
          "If your item arrives faulty, contact us within 48 hours so we can arrange a replacement or refund quickly.",
        ],
      },
      {
        heading: "Warranty cover",
        body: [
          "Many devices carry a manufacturer's warranty, typically covering manufacturing defects for a limited period from purchase.",
        ],
        list: [
          "Devices and batteries: generally up to 6 months, unless stated otherwise.",
          "Tanks and pods: generally 30 days for manufacturing defects.",
          "Coils, wires, cotton and disposables: consumable items and not covered by warranty.",
        ],
      },
      {
        heading: "What is not covered",
        list: [
          "Damage from misuse, drops, water or incorrect charging.",
          "Normal wear and tear, including battery capacity loss over time.",
          "Consumable parts such as coils and cotton.",
          "Products tampered with or repaired by a third party.",
        ],
      },
      {
        heading: "How to start a return",
        body: [
          `Contact us at ${COMPANY_EMAIL} with your order number and a description of the issue, including photos where helpful. We will confirm whether a return is required and provide instructions. Please do not send items back before contacting us.`,
        ],
      },
      {
        heading: "Refunds and timing",
        body: [
          "Once we receive and inspect a returned item, we will process your refund to the original payment method within 14 days. Please allow additional time for your bank to post the refund.",
        ],
      },
      {
        heading: "Returns and age-restricted goods",
        body: [
          "Returns of age-restricted products may require age verification. Restocking and return-shipping charges may apply where a return is not due to a fault.",
        ],
      },
      CONTACT,
    ],
  },
  {
    slug: "delivery-information",
    title: "Delivery Information",
    summary:
      "UK delivery options, timescales, prices, tracking and restrictions.",
    updated: UPDATED,
    image: "/policies/hero-terms.webp",
    intro: [
      "This page sets out how we deliver your order, the options available and what to do if something goes wrong.",
    ],
    sections: [
      {
        heading: "Age-restricted delivery",
        body: [
          "All deliveries containing age-restricted products must be received by a person aged 18 or over. Our couriers may request proof of age and will not leave restricted goods unattended or with a neighbour.",
        ],
      },
      {
        heading: "UK delivery options and timescales",
        list: [
          "Standard tracked delivery: typically 2 to 4 working days.",
          "Express tracked delivery: typically next working day for orders placed before the cut-off.",
          "Collect from store: available where a store collection point is offered at checkout.",
        ],
      },
      {
        heading: "Order cut-off times",
        body: [
          "Orders placed before the daily cut-off on a working day are usually dispatched the same day. Orders placed after the cut-off, at weekends or on bank holidays are dispatched on the next working day.",
        ],
      },
      {
        heading: "Delivery charges and free delivery",
        body: [
          "Delivery charges are calculated at checkout based on the service and destination. Free standard delivery may apply to orders over the qualifying threshold shown on the site.",
        ],
      },
      {
        heading: "International delivery",
        body: [
          "We may not be able to ship age-restricted products outside the UK. Where international delivery is offered, the recipient is responsible for any customs duties, taxes or local restrictions.",
        ],
      },
      {
        heading: "Tracking your order",
        body: [
          "Once your order is dispatched you will receive tracking details by email so you can follow its progress.",
        ],
      },
      {
        heading: "Delayed, lost or damaged orders",
        body: [
          `If your order has not arrived within the expected timescale, is damaged or is missing items, contact us at ${COMPANY_EMAIL} as soon as possible so we can investigate with the courier and put things right.`,
        ],
      },
      {
        heading: "Failed deliveries",
        body: [
          "If age verification cannot be completed at the door or nobody is available to receive the order, the courier may return it to the depot or to us. Additional delivery charges may apply to re-send the order.",
        ],
      },
      CONTACT,
    ],
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return policies.find((policy) => policy.slug === slug);
}

export function getPolicySlugs(): string[] {
  return policies.map((policy) => policy.slug);
}
