const { createStrapi } = require('@strapi/strapi');
const path = require('path');

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

async function main() {
  console.log("Starting Strapi instance...");
  const app = createStrapi({ distDir: path.join(process.cwd(), 'dist') });
  await app.load();

  console.log("Fetching all services...");
  try {
    const services = await app.documents('api::service.service').findMany({
      populate: ['faqs']
    });

    console.log(`Found ${services.length} services`);

    for (const service of services) {
      if (!service.faqs || service.faqs.length === 0) {
        console.log(`Updating FAQs for service: ${service.title} (${service.documentId})`);
        await app.documents('api::service.service').update({
          documentId: service.documentId,
          data: {
            faqs: defaultFaqs
          },
          status: 'published'
        });
      } else {
        console.log(`Service ${service.title} already has FAQs`);
      }
    }
    console.log("All services updated successfully!");
  } catch (error) {
    console.error("Error updating:", error);
  }

  process.exit(0);
}

main();
