const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5437,
  user: 'postgres',
  password: 'VynTech2024',
  database: 'vyntech_strapi'
});

const defaultFaqs = [
  {
    question: "What services does VynTech Solutions provide?",
    answer: "We offer end-to-end digital solutions including Web & Mobile App Development, UI/UX Design, Cloud Infrastructure, AI & Machine Learning, E-commerce Solutions, and Custom Enterprise Software."
  },
  {
    question: "How long does a typical project take to complete?",
    answer: "The timeline varies depending on the project's scope and complexity. A standard web application might take 4-8 weeks, while complex enterprise solutions can take 3-6 months. We provide detailed timelines during the discovery phase."
  },
  {
    question: "Do you offer post-launch support and maintenance?",
    answer: "Yes, we provide comprehensive post-launch support and maintenance packages. This includes regular security updates, performance monitoring, bug fixes, and feature enhancements to keep your application running smoothly."
  },
  {
    question: "How do you ensure the security of our data and applications?",
    answer: "Security is our top priority. We implement industry best practices, including data encryption, secure authentication (OAuth/JWT), regular vulnerability assessments, and compliance with standards like GDPR and HIPAA where applicable."
  },
  {
    question: "Can you integrate with our existing software and tools?",
    answer: "Absolutely. We have extensive experience building seamless integrations with various third-party APIs, CRM systems (Salesforce, HubSpot), payment gateways, and enterprise software to ensure your systems communicate effectively."
  },
  {
    question: "Will I have a dedicated project manager?",
    answer: "Yes, every project is assigned a dedicated project manager who serves as your primary point of contact. They ensure clear communication, track progress, and make sure the project is delivered on time and within budget."
  },
  {
    question: "What is your pricing model?",
    answer: "We offer flexible pricing models based on your needs: Fixed-Price for well-defined projects, Time & Material for ongoing development with evolving requirements, and Dedicated Teams for long-term engagements."
  },
  {
    question: "Do you sign Non-Disclosure Agreements (NDAs)?",
    answer: "Yes, we are fully committed to protecting your intellectual property. We are happy to sign NDAs before any project discussions begin to ensure your ideas and data remain strictly confidential."
  },
  {
    question: "What industries do you specialize in?",
    answer: "We have successfully delivered solutions across various industries including Healthcare, Finance (FinTech), E-commerce, Education (EdTech), Real Estate, and Logistics. Our adaptable expertise allows us to understand and solve domain-specific challenges."
  },
  {
    question: "How do we get started?",
    answer: "Getting started is easy! Simply reach out to us via our contact form or book a free consultation. We'll discuss your requirements, propose a tailored solution, and outline the next steps to kick off your project."
  }
];

async function run() {
  await client.connect();

  try {
    // Check if FAQs already exist in services_cmps
    const checkRes = await client.query(`SELECT COUNT(*) FROM services_cmps WHERE field = 'faqs'`);
    if (parseInt(checkRes.rows[0].count) > 0) {
      console.log('FAQs already linked in services_cmps, clearing them first...');
      await client.query(`DELETE FROM services_cmps WHERE field = 'faqs'`);
      await client.query(`DELETE FROM components_shared_faqs`);
    }

    const insertedFaqIds = [];
    
    // Insert FAQs
    for (const faq of defaultFaqs) {
      const res = await client.query(
        'INSERT INTO components_shared_faqs (question, answer) VALUES ($1, $2) RETURNING id',
        [faq.question, faq.answer]
      );
      insertedFaqIds.push(res.rows[0].id);
    }
    
    console.log(`Inserted ${insertedFaqIds.length} FAQs.`);

    // Get all service IDs
    const servicesRes = await client.query('SELECT id FROM services');
    const serviceIds = servicesRes.rows.map(r => r.id);
    
    console.log(`Found ${serviceIds.length} services (draft + published). Linking FAQs...`);

    let linkCount = 0;
    for (const entityId of serviceIds) {
      for (let i = 0; i < insertedFaqIds.length; i++) {
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, component_type, field, "order") 
           VALUES ($1, $2, 'shared.faq', 'faqs', $3)`,
          [entityId, insertedFaqIds[i], i + 1]
        );
        linkCount++;
      }
    }
    
    console.log(`Successfully created ${linkCount} links for FAQs across all services.`);
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
