const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5437,
  user: 'postgres',
  password: 'VynTech2024',
  database: 'vyntech_strapi'
});

const defaultHeading = "Why choose us";
const defaultIntro = "Digital solutions are the core of every successful online business today. Whether it's driving qualified traffic or building scalable software, a strong digital strategy is essential to grow revenue and stay competitive. VynTech Solutions is a premier agency offering custom website development and full-scale software engineering for businesses that refuse to settle for average.";
const defaultSubHeading = "Imagination Into Creativity";
const defaultSubText = "As a dedicated software and web development company, we've worked on websites and web applications for incredible clients across diverse industries. This has stretched our imagination into new realms of creativity, letting us apply technical expertise to enhance user experience — and consistently deliver bespoke solutions that reflect our clients' real goals.";

const defaultCards = [
  { icon: "chart", label: "Result Driven\nApproach" },
  { icon: "desktop", label: "Digital First\nStrategies" },
  { icon: "users", label: "Team of Experienced\nProfessionals" },
  { icon: "clock", label: "On Time Delivery" },
  { icon: "check", label: "No False\nCommitments" },
  { icon: "trend", label: "Data-driven experiments" }
];

async function run() {
  await client.connect();

  try {
    // 1. Update scalar fields for all services
    await client.query(`
      UPDATE services 
      SET 
        "why_choose_us_heading" = $1,
        "why_choose_us_intro" = $2,
        "why_choose_us_sub_heading" = $3,
        "why_choose_us_sub_text" = $4
      WHERE "why_choose_us_heading" IS NULL
    `, [defaultHeading, defaultIntro, defaultSubHeading, defaultSubText]);
    
    console.log('Updated scalar fields for services.');

    // 2. Ensure cards are in components_sections_value_cards
    // We can just insert them anew to avoid conflict and keep logic simple, or check existing.
    // It's cleaner to just insert new ones and link them to the services that lack them.
    
    const servicesRes = await client.query('SELECT id FROM services');
    const serviceIds = servicesRes.rows.map(r => r.id);
    
    // Find services that don't have whyChooseUsCards linked yet
    const existingLinks = await client.query(`SELECT DISTINCT entity_id FROM services_cmps WHERE field = 'whyChooseUsCards'`);
    const existingSet = new Set(existingLinks.rows.map(r => parseInt(r.entity_id)));
    
    const servicesToUpdate = serviceIds.filter(id => !existingSet.has(id));
    console.log(`Found ${servicesToUpdate.length} services missing whyChooseUsCards.`);

    if (servicesToUpdate.length > 0) {
      // Insert cards once
      const insertedCardIds = [];
      for (const card of defaultCards) {
        const res = await client.query(
          'INSERT INTO components_sections_value_cards (icon, label) VALUES ($1, $2) RETURNING id',
          [card.icon, card.label]
        );
        insertedCardIds.push(res.rows[0].id);
      }

      // Link them
      let linkCount = 0;
      for (const entityId of servicesToUpdate) {
        for (let i = 0; i < insertedCardIds.length; i++) {
          await client.query(
            `INSERT INTO services_cmps (entity_id, cmp_id, component_type, field, "order") 
             VALUES ($1, $2, 'sections.value-card', 'whyChooseUsCards', $3)`,
            [entityId, insertedCardIds[i], i + 1]
          );
          linkCount++;
        }
      }
      console.log(`Successfully created ${linkCount} links for whyChooseUsCards.`);
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
