"""Turns a raw CTFd export into the dataset that is safe to commit.

    python sanitize_export.py raw.zip out.zip '<bcrypt hash of admin password>'

- the admin account is replaced with admin / admin@duca.local / admin-password
  (the raw export contains whoever set the instance up, with their real email
  and password hash)
- file records are dropped: the fake uploads do not exist, so they would only
  be broken download links
- the docker bridge IP in tracking rows becomes 127.0.0.1
- the zip is written deterministically (sorted, fixed timestamps) so re-exports
  only show real changes in git
"""
import json
import sys
import zipfile

src, dst, admin_hash = sys.argv[1:4]
ADMIN = {"name": "admin", "email": "admin@duca.local", "password": admin_hash, "secret": None}


def rows(text):
    return json.loads(text) if text.strip() else None


with zipfile.ZipFile(src) as zin, zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zout:
    for name in sorted(zin.namelist()):
        data = zin.read(name)

        if name == "db/users.json":
            doc = rows(data.decode())
            for user in doc["results"]:
                if user["type"] == "admin":
                    user.update(ADMIN)
            data = json.dumps(doc, indent=2).encode()
        elif name == "db/files.json":
            doc = rows(data.decode())
            doc["results"] = []
            doc["count"] = 0
            data = json.dumps(doc, indent=2).encode()
        elif name == "db/tracking.json":
            doc = rows(data.decode())
            for row in doc["results"]:
                if row.get("ip", "").startswith("172."):
                    row["ip"] = "127.0.0.1"
            data = json.dumps(doc, indent=2).encode()
        elif name.endswith(".json") and data.strip():
            data = json.dumps(json.loads(data), indent=2).encode()

        info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        zout.writestr(info, data)
print(f"wrote {dst}")
