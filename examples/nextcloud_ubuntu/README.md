# file locations:
```
/usr/local/bin/pm_ingest.sh
```
## debian / ubuntu files:
```
/etc/systemd/system/pm_ingest.timer
```
```
/etc/systemd/system/pm_ingest.service
```
Enable service via:

```
systemctl daemon-reload
systemctl enable --now pm_ingest.timer
```