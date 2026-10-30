"""Creates a demo player (and team) so you can log in and see the player UI.

Run through seed-random.sh. Needs the CTFd app context, so it is piped into the
container's python rather than run on the host.
"""
import os

from CTFd import create_app
from CTFd.models import Brackets, Teams, Users, db
from CTFd.utils import get_config

DEMO_USER = os.environ.get("DEMO_USER", "demo")
DEMO_PASSWORD = os.environ.get("DEMO_PASSWORD", "demo-password")

app = create_app()
with app.app_context():
    # populate.py creates brackets, and CTFd then forces players to pick one
    user_bracket = Brackets.query.filter_by(type="users").first()
    team_bracket = Brackets.query.filter_by(type="teams").first()

    user = Users.query.filter_by(name=DEMO_USER).first()
    if user:
        print(f"demo user '{DEMO_USER}' already exists")
        raise SystemExit(0)

    user = Users(
        name=DEMO_USER,
        email=f"{DEMO_USER}@duca.local",
        password=DEMO_PASSWORD,
        verified=True,
        bracket_id=user_bracket.id if user_bracket else None,
    )
    db.session.add(user)
    db.session.commit()

    if get_config("user_mode") == "teams":
        team = Teams(
            name="DUCA Demo",
            email="demo-team@duca.local",
            password=DEMO_PASSWORD,
            bracket_id=team_bracket.id if team_bracket else None,
        )
        team.members.append(user)
        db.session.add(team)
        db.session.commit()
        team.captain_id = user.id
        user.team_id = team.id
        db.session.commit()

    print(f"created demo user '{DEMO_USER}' / '{DEMO_PASSWORD}'")
