Per the note under step one of the README's "How to run locally" section, here is the SQL query needed to create the `users` materialized view.

```sql
CREATE MATERIALIZED VIEW users AS
  SELECT u.fid,
    f.created_at,
    f.custody_address,
    max(
        CASE
            WHEN u.type = 1 THEN u.value
            ELSE NULL::text
        END) AS pfp,
    max(
        CASE
            WHEN u.type = 2 THEN u.value
            ELSE NULL::text
        END) AS display,
    max(
        CASE
            WHEN u.type = 3 THEN u.value
            ELSE NULL::text
        END) AS bio,
    max(
        CASE
            WHEN u.type = 5 THEN u.value
            ELSE NULL::text
        END) AS url,
    max(
        CASE
            WHEN u.type = 6 THEN u.value
            ELSE NULL::text
        END) AS fname
   FROM user_data u
     JOIN fids f ON u.fid = f.fid
  GROUP BY u.fid, f.created_at, f.custody_address
  ORDER BY u.fid;
```