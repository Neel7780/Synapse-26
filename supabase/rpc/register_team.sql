-- Create a function to handle event registration, team creation, and member addition transactionally
create or replace function register_team(
  p_event_id bigint,
  p_fee_id bigint,
  p_registered_by_user_id uuid,
  p_payment_screenshot_url text,
  p_transaction_id text,
  p_payment_status public.payment_status,
  p_gross_amount numeric,
  p_team_member_user_ids uuid[]
) returns json
language plpgsql
as $$
declare
  v_registration_id bigint;
  v_team_id bigint;
  v_member_id uuid;
begin
  -- 1. Insert into event_registrations
  insert into event_registrations (
    event_id,
    fee_id,
    registered_by_user_id,
    payment_screenshot_url,
    transaction_id,
    payment_status,
    gross_amount,
    registration_date
  ) values (
    p_event_id,
    p_fee_id,
    p_registered_by_user_id,
    p_payment_screenshot_url,
    p_transaction_id,
    p_payment_status,
    p_gross_amount,
    now()
  ) returning registration_id into v_registration_id;

  -- 2. Create the team
  insert into team (
    registration_id
  ) values (
    v_registration_id
  ) returning team_id into v_team_id;

  -- 3. Add team members
  if p_team_member_user_ids is not null and array_length(p_team_member_user_ids, 1) > 0 then
    foreach v_member_id in array p_team_member_user_ids
    loop
      insert into team_members (
        team_id,
        user_id
      ) values (
        v_team_id,
        v_member_id
      );
    end loop;
  end if;

  return json_build_object(
    'success', true,
    'registration_id', v_registration_id,
    'team_id', v_team_id
  );
exception when others then
  return json_build_object(
    'success', false,
    'error', SQLERRM
  );
end;
$$;
