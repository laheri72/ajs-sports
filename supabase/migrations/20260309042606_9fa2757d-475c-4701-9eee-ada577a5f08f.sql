
-- Fix: re-create triggers that failed due to already existing
DROP TRIGGER IF EXISTS trg_auto_interest_on_participation ON public.participations;
DROP TRIGGER IF EXISTS trg_auto_interest_on_result ON public.results;
DROP TRIGGER IF EXISTS trg_auto_interest_on_club_join ON public.club_members;
DROP TRIGGER IF EXISTS trg_auto_interest_on_club_event_attendance ON public.club_event_participants;
DROP TRIGGER IF EXISTS trg_auto_match_request_status ON public.match_request_players;
DROP TRIGGER IF EXISTS trg_auto_match_request_reopen ON public.match_request_players;
DROP TRIGGER IF EXISTS trg_auto_interest_on_buddy_match ON public.match_request_players;

CREATE TRIGGER trg_auto_interest_on_participation
AFTER INSERT ON public.participations
FOR EACH ROW EXECUTE FUNCTION public.auto_interest_on_participation();

CREATE TRIGGER trg_auto_interest_on_result
AFTER INSERT ON public.results
FOR EACH ROW EXECUTE FUNCTION public.auto_interest_on_result();

CREATE TRIGGER trg_auto_interest_on_club_join
AFTER INSERT ON public.club_members
FOR EACH ROW EXECUTE FUNCTION public.auto_interest_on_club_join();

CREATE TRIGGER trg_auto_interest_on_club_event_attendance
AFTER UPDATE ON public.club_event_participants
FOR EACH ROW EXECUTE FUNCTION public.auto_interest_on_club_event_attendance();

CREATE TRIGGER trg_auto_match_request_status
AFTER INSERT ON public.match_request_players
FOR EACH ROW EXECUTE FUNCTION public.auto_match_request_status();

CREATE TRIGGER trg_auto_match_request_reopen
AFTER DELETE ON public.match_request_players
FOR EACH ROW EXECUTE FUNCTION public.auto_match_request_reopen();

CREATE TRIGGER trg_auto_interest_on_buddy_match
AFTER INSERT ON public.match_request_players
FOR EACH ROW EXECUTE FUNCTION public.auto_interest_on_buddy_match();
