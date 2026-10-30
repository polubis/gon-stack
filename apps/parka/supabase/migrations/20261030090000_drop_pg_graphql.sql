-- Parka talks to Supabase only through REST (supabase-js), never /graphql/v1.
-- Dropping pg_graphql frees idle memory on the free tier.

drop extension if exists pg_graphql;
