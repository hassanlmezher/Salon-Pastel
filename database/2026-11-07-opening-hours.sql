-- The owner sets the salon's weekly opening hours from the admin, and the home page shows them.
-- Free booking times already come from weekly_working_hours, so a change applies to new bookings at once.

-- One row per weekday (0 = Sunday), with "HH:MM" times; a closed day has null times.
create or replace function opening_hours_json()
returns jsonb
language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'day', d.day,
    'open', coalesce(not h.is_closed and h.opens_at is not null and h.closes_at is not null, false),
    'opensAt', case when h.is_closed then null else to_char(h.opens_at, 'HH24:MI') end,
    'closesAt', case when h.is_closed then null else to_char(h.closes_at, 'HH24:MI') end
  ) order by d.day), '[]'::jsonb)
  from generate_series(0, 6) as d(day)
  left join lateral (
    select * from weekly_working_hours w where w.day_of_week = d.day limit 1
  ) h on true;
$$;

create or replace function get_opening_hours()
returns jsonb
language sql stable security definer set search_path to 'public' as $$
  select opening_hours_json();
$$;

create or replace function admin_get_working_hours(p_token_hash text)
returns jsonb
language plpgsql stable security definer set search_path to 'public' as $$
begin
  perform admin_require_session(p_token_hash);
  return opening_hours_json();
end;
$$;

-- p_hours: all seven days, each {"day": 0-6, "open": true/false, "opensAt": "HH:MM", "closesAt": "HH:MM"}.
create or replace function admin_set_working_hours(p_token_hash text, p_hours jsonb)
returns void
language plpgsql security definer set search_path to 'public' as $$
declare
  v_item jsonb;
  v_day integer;
  v_open boolean;
  v_opens time;
  v_closes time;
begin
  perform admin_require_session(p_token_hash);

  if jsonb_typeof(p_hours) <> 'array' or jsonb_array_length(p_hours) <> 7
    or (select count(distinct (x->>'day')::integer) from jsonb_array_elements(p_hours) x where (x->>'day') ~ '^[0-6]$') <> 7 then
    raise exception 'Invalid opening hours';
  end if;

  delete from weekly_working_hours;

  for v_item in select * from jsonb_array_elements(p_hours) loop
    v_day := (v_item->>'day')::integer;
    v_open := coalesce((v_item->>'open')::boolean, false);
    v_opens := null;
    v_closes := null;

    if v_open then
      if coalesce(v_item->>'opensAt', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        or coalesce(v_item->>'closesAt', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
        raise exception 'Invalid opening hours';
      end if;
      v_opens := (v_item->>'opensAt')::time;
      v_closes := (v_item->>'closesAt')::time;
      if v_closes <= v_opens then
        raise exception 'Closing time must be after opening time';
      end if;
    end if;

    insert into weekly_working_hours (day_of_week, opens_at, closes_at, is_closed)
    values (v_day, v_opens, v_closes, not v_open);
  end loop;
end;
$$;

revoke all on function opening_hours_json() from public;
revoke all on function get_opening_hours() from public;
revoke all on function admin_get_working_hours(text) from public;
revoke all on function admin_set_working_hours(text, jsonb) from public;
grant execute on function get_opening_hours() to pastel_booking;
grant execute on function admin_get_working_hours(text) to pastel_admin;
grant execute on function admin_set_working_hours(text, jsonb) to pastel_admin;
