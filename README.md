
# Nextcloud importer für Rechnungen

Dieses Tool ist für die Verwendung mit dem SFTP Export von Invoicefetcher.com konzipiert.

Im Eingabeverzeichnis angelieferte Rechnungen als pdf/json Dateipaar werden in die konfigurierte Nextcloud Instanz hochgeladen. 
Nach der Verarbeitung werden die Dateien in das Ausgabeverzeichnis verschoben.

Parallel zum Nextcloud Upload werden die Informationen über die Rechnung in eine Datenbank geschrieben. 

Untehalb des Basisverzeichnis wird ein Unterordner mit dem Namen des Lieferanten erstellt. 
Wenn in der JSON Datei kein Lieferant angegeben wird, dann wird "UNBEKANNT" als Standardwert gesetzt. 
Die koplette JSON Datei wird zusätzlich in Nextcloud als Kommentar hinzugefügt.

Nach dem Upload werden in Nextcloud die folgenden Tags zur Datei hinzugefügt:
- Statischer Tag mit dem Wert aus NEXTCLOUD_SOURCE_TAG
- Name des Lieferanten  

# Konfiguration 

Die Konfiguration der Anwendung erfolgt über Umgebungsvariablen:

- NEXTCLOUD_USERNAME Benutzername für Nextcloud 
- NEXTCLOUD_PASSWORD Passwort für Nextcloud 
- NEXTCLOUD_URL Nextcloud Berver, https://<server>/remote.php/webdav
- NEXTCLOUD_BASEFOLDER Basisverzeichnis für Upload, z.B. "/Rechnungen"
- NEXTCLOUD_SOURCE_TAG Tag, der bei jedem Upload gesetzt wird
- MYSQL_HOST Host der MySQL Datenbank  
- MYSQL_PORT Port der MySQL Datenbank
- MYSQL_USER User der MySQL Datenbank
- MYSQL_PASS Passwort der MySQL Datenbank
- MYSQL_DB Name der MySQL Datenbank
- FOLDER_IN Eingabeverzeichnis, muss einen / am ende enthalten
- FOLDER_PROCESSED Ausgabeverzeicnis für verarbeitete Daten 
- CRON_SCHEDULE Cron-Pattern für regelmäßige Ausführung, z.B. "*/5 * * * *"

# MySQL Tabelle 

```
CREATE TABLE Rechnungen (
	file VARCHAR(1024) NOT NULL,
	sender VARCHAR(255) NOT NULL,
	date DATE NOT NULL,
	amount DECIMAL(5,2) NULL DEFAULT NULL,
	number VARCHAR(255) NULL DEFAULT NULL,
	currency VARCHAR(10) NULL DEFAULT NULL,
	PRIMARY KEY (file)
)
```
