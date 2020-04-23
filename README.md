
# Nextcloud importer für Rechnungen

Dieses Tool ist für die Verwendung mit dem SFTP Export von Invoicefetcher.com konzipiert.

Im Eingabeverzeichnis angelieferte Rechnungen als pdf/json Dateipaar werden in die konfigurierte Nextcloud Instanz hochgeladen. 
Nach der Verarbeitung werden die Dateien in das Ausgabeverzeichnis verschoben.

Untehalb des Basisverzeichnis wird ein Unterordnetr mit dem Namen des Lieferanten erstellt. 
Wenn in der JSON Datei kein Lieferant angegeben wird, dann wird "UNBEKANNT" als Standardwert gesetzt. 
Die koplette JSON Datei wird zusätzlich in Nextcloud als Kommentar hinzugefügt.

Nach dem Upßload werden in nextclou die folgenden Tags zur Datei hinzugefügt:
- Statischer Tag mit dem Wert aus NEXTCLOUD_SOURCE_TAG
- Name des Lieferanten  

Die Konfiguration der Anwendung erfolgt über Umgebungsvariablen:

- NEXTCLOUD_USERNAME Benutzername für Nextcloud 
- NEXTCLOUD_PASSWORD Passwort für Nextcloud 
- NEXTCLOUD_URL Nextcloud Berver, https://<server>/remote.php/webdav
- NEXTCLOUD_BASEFOLDER Basisverzeichnis für Upload, z.B. "/Rechnungen"
- NEXTCLOUD_SOURCE_TAG Tag, der bei jedem Upload gesetzt wird
- FOLDER_IN Eingabeverzeichnis, muss einen / am ende enthalten
- FOLDER_PROCESSED Ausgabeverzeicnis für verarbeitete Daten 
- CRON_SCHEDULE Cron-Pattern für regelmäßige Ausführung, z.B. "*/5 * * * *"

