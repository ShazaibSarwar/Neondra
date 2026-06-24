import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Person, GuestFamily, Relation } from './src/database/models';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  console.log('Starting data migration...');

  try {
    const sequelize = app.get(require('@nestjs/sequelize').getConnectionToken());
    console.log('Syncing database...');
    await sequelize.sync(); // Create missing tables
    console.log('Database synced.');

    try {
      await sequelize.query('ALTER TABLE "persons" ADD COLUMN "guest_family_id" UUID;');
      console.log('Added guest_family_id to persons');
    } catch(e: any) { console.log('guest_family_id already exists or error:', e.message); }

    try {
      await sequelize.query('ALTER TABLE "persons" ADD COLUMN "relation_id" UUID;');
      console.log('Added relation_id to persons');
    } catch(e: any) { console.log('relation_id already exists or error:', e.message); }

    const persons = await Person.findAll({
      where: {
        relation_id: null,
      }
    });

    console.log(`Found ${persons.length} persons to migrate.`);

    for (const person of persons) {
      if (!person.family_id) continue;

      let relationName = person.getDataValue('relation') || 'Other';
      
      // Find or create Relation
      let [relation] = await Relation.findOrCreate({
        where: { name: relationName, family_id: person.family_id },
        defaults: { name: relationName, family_id: person.family_id }
      });

      // Find or create GuestFamily (using person's name temporarily as household name if none exists)
      // Often people from the same household share a family name or we can just group individuals 
      // into their own GuestFamily for now so they can be grouped later.
      let householdName = `${person.name}'s Family`;
      let [guestFamily] = await GuestFamily.findOrCreate({
        where: { name: householdName, family_id: person.family_id },
        defaults: { name: householdName, family_id: person.family_id }
      });

      // Update person
      person.relation_id = relation.id;
      person.guest_family_id = guestFamily.id;
      await person.save();
      console.log(`Migrated ${person.name}`);
    }

    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await app.close();
  }
}

bootstrap();
