const { createStrapi } = require('@strapi/strapi');

async function main() {
  console.log("Starting Strapi instance...");
  const app = createStrapi({ dir: process.cwd() });
  await app.load();

  const documentId = "h4klp70oqaswneip0jzrnt8l"; // web-development document ID

  console.log("Updating document: " + documentId);
  try {
    const updated = await app.documents('api::service.service').update({
      documentId: documentId,
      data: {
        whyChooseUsCards: [
          { icon: "chart", label: "Result Driven\nApproach" },
          { icon: "desktop", label: "Digital First\nStrategies" },
          { icon: "users", label: "Team of Experienced\nProfessionals" },
          { icon: "clock", label: "On Time Delivery" },
          { icon: "check", label: "No False\nCommitments" },
          { icon: "trend", label: "Data-driven experiments" }
        ],
        deliverySteps: [
          {
            title: "Discovery & Product Strategy",
            content: "We define product goals, target audience requirements, feature prioritization, system architecture blueprints, and a clear execution roadmap before writing code."
          },
          {
            title: "UX/UI Design & Prototyping",
            content: "Our design team crafts intuitive user journeys, wireframes, high-fidelity UI components, and interactive prototypes tailored for high conversion and seamless interaction."
          },
          {
            title: "Agile Engineering & QA",
            content: "We build scalable frontend and backend systems using agile 2-week sprints, automated unit/integration testing, continuous code reviews, and frequent demo deployments."
          },
          {
            title: "Cloud Deployment & DevOps",
            content: "We establish automated CI/CD pipelines, containerized environments, secure cloud infrastructure, and zero-downtime deployment strategies on AWS, Azure, or GCP."
          },
          {
            title: "Support, Optimize & Scale",
            content: "After launch, we continuously monitor app performance, perform security audits, optimize load times, and ship ongoing feature enhancements to support your business growth."
          }
        ]
      },
      status: 'published'
    });
    console.log("Update successful!");
  } catch (error) {
    console.error("Error updating:", error);
  }

  process.exit(0);
}

main();
