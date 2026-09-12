from app import create_app
from extensions import db
from models import User


def seed():
    app = create_app()
    with app.app_context():
        if User.query.count() > 0:
            print(f"[seed] {User.query.count()} users already exist, skipping.")
            return

        admin = User(
            email="admin@marsamaroc.ma",
            full_name="Administrateur",
            role="admin",
            department="DSI",
        )
        admin.set_password("admin123")

        agent = User(
            email="agent@marsamaroc.ma",
            full_name="Agent Test",
            role="agent",
            department="Exploitation",
        )
        agent.set_password("agent123")

        viewer = User(
            email="viewer@marsamaroc.ma",
            full_name="Lecteur Test",
            role="viewer",
            department="Direction",
        )
        viewer.set_password("viewer123")

        db.session.add_all([admin, agent, viewer])
        db.session.commit()
        print("[seed] Created 3 users:")
        print("  - admin@marsamaroc.ma / admin123")
        print("  - agent@marsamaroc.ma / agent123")
        print("  - viewer@marsamaroc.ma / viewer123")


if __name__ == "__main__":
    seed()