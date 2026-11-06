-- Luxury Spa for Hands is done by its own staff member, not the owner, and takes 30 minutes.
-- The booking site books it as either of these two rows, so both point at that person.
insert into employees (name, category_id, is_active)
select 'Hand Spa Specialist', category_id, true from services where name = 'Paraffin Hand Therapy'
  and not exists (select 1 from employees where name = 'Hand Spa Specialist');

update services
set employee_id = (select id from employees where name = 'Hand Spa Specialist'),
    duration_minutes = 30
where name in ('Luxary Spa For Hands', 'Paraffin Hand Therapy');
