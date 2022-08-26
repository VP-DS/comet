import { Migration } from '@mikro-orm/migrations';

export class Migration20220826124053 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "Product" ("id" uuid not null, "title" text not null, "description" text not null, "slug" text not null, "price" numeric(10,0) null, "image" json not null, "createdAt" timestamp with time zone not null, "updatedAt" timestamp with time zone not null);');
    this.addSql('alter table "Product" add constraint "Product_pkey" primary key ("id");');
  }

  async down(): Promise<void> {

    this.addSql('drop table if exists "Product" cascade;');
  }

}
