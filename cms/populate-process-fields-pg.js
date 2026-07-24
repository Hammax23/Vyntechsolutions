const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5437,
  user: 'postgres',
  password: 'VynTech2024',
  database: 'vyntech_strapi'
});

async function run() {
  await client.connect();

  try {
    const servicesRes = await client.query('SELECT id, title FROM services');
    
    for (const service of servicesRes.rows) {
      // Find the process steps for this service
      const stepsRes = await client.query(`
        SELECT ps.step 
        FROM components_shared_process_steps ps
        JOIN services_cmps sc ON sc.cmp_id = ps.id
        WHERE sc.entity_id = $1 AND sc.field = 'process'
        ORDER BY sc."order" ASC
      `, [service.id]);
      
      const steps = stepsRes.rows.map(r => r.step);
      
      if (steps.length === 0) continue;

      const stepsText = steps.slice(0, 5).join(", ");
      const heading = `Our ${service.title} Process: Discover to Scale`;
      const desc = `Our ${service.title.toLowerCase()} services follow a proven <strong class="text-[#1a1a2e]">five-phase process</strong> — ${stepsText} — so every project is structured, measurable, and built to grow safely after go-live.`;
      
      await client.query(`
        UPDATE services
        SET process_heading = $1, process_description = $2
        WHERE id = $3
      `, [heading, desc, service.id]);
      
      console.log(`Updated process info for service: ${service.title}`);
    }
    console.log("All services updated.");
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
