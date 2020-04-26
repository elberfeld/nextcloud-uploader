
import cron = require('node-cron');
import fs = require('fs')
import format = require('date-format');
import glob = require('glob');
import MySQL = require('sync-mysql'); 

import Client, { File, Folder, Tag, } from "nextcloud-node-client";

	

function log(message: string) {

    console.log(format(format.ISO8601_FORMAT, new Date()) + ' ' +message);
}

function processFile(jsonfile) {

    (async () => {

        try {

            log('processFile(' + jsonfile +'): START');
        
            if ( ! fs.existsSync(jsonfile)) {
        
                log('processFile(' + jsonfile +'): ERROR: jsonfile does not exist: ' + jsonfile); 
                return;
            }
        
            const pdffile = jsonfile.replace(/\.json$/g, '.pdf');
            log('processFile(' + jsonfile +'): pdffile = ' + pdffile);
        
            if ( ! fs.existsSync(pdffile)) {
        
                log('processFile(' + jsonfile +'): ERROR: pdffile does not exist: ' + pdffile);
                return;
            }
        
            // Read JSON Data 

            const jsonraw  = fs.readFileSync(jsonfile,'utf8');
            log('processFile(' + jsonfile +'): ' + jsonraw);

            const jsondata = JSON.parse(jsonraw);

            const sender_name = (typeof jsondata.sender_name == 'string' && jsondata.sender_name.length > 0 ) ? jsondata.sender_name : "UNBEKANNT"; 
            log('processFile(' + jsonfile +'): sender_name = ' + sender_name);

            const invoice_date = (typeof jsondata.invoice_date == 'string' && jsondata.invoice_date.length > 0 ) ? jsondata.invoice_date : format("yyyy-mm-dd", new Date()); 
            log('processFile(' + jsonfile +'): invoice_date = ' + invoice_date);

            const gross_amount = (typeof jsondata.gross_amount == 'number' ) ? jsondata.gross_amount : "NULL"; 
            log('processFile(' + jsonfile +'): gross_amount = ' + gross_amount);

            const invoice_number = (typeof jsondata.invoice_number == 'string' && jsondata.invoice_number.length > 0 ) ? jsondata.invoice_number : ""; 
            log('processFile(' + jsonfile +'): invoice_number = ' + invoice_number);


            // Write to MySQL table

            const mysql_update = "REPLACE INTO Rechnungen ( sender, date, amount, number, file ) VALUES ( '" + sender_name + "', '" + invoice_date + "', " + gross_amount + ", '" + invoice_number + "', '" + pdffile.replace(process.env.FOLDER_IN, "") + "')";
            log('processFile(' + jsonfile +'): ' + mysql_update);

            log('processFile(' + jsonfile +'): Connecting to mysql: ' + process.env.MYSQL_DB);
            
            const mysql_con = new MySQL({
                host: process.env.MYSQL_HOST,
                port: process.env.MYSQL_PORT,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASS,
                database: process.env.MYSQL_DB
            });

            const mysql_result = mysql_con.query(mysql_update);
            log('processFile(' + jsonfile +'): query sent, affectedRows = ' + mysql_result.affectedRows);


            // Upload to NextCloud 

            log('processFile(' + jsonfile +'): connecting to NextCloud Server: ' + process.env.NEXTCLOUD_URL);
            const client = new Client();
        
            log('processFile(' + jsonfile +'): NEXTCLOUD_FOLDER = ' + process.env.NEXTCLOUD_BASEFOLDER);
            const base_folder: Folder = await client.getFolder(process.env.NEXTCLOUD_BASEFOLDER);

            if (base_folder == null) {

                log('processFile(' + jsonfile +'): basefolder not found');
                return;
            }

            log('processFile(' + jsonfile +'): subfolder = ' + sender_name);
            const subfolder_exists: boolean = await base_folder.hasSubFolder(sender_name);

            if ( subfolder_exists ) {

                log('processFile(' + jsonfile +'): subfolder exists');

            } else {

                log('processFile(' + jsonfile +'): create subfolder ');
                await base_folder.createSubFolder(sender_name);
            }

            log('processFile(' + jsonfile +'): target_folder = ' + process.env.NEXTCLOUD_BASEFOLDER + '/' + sender_name);
            const target_folder: Folder = await client.getFolder(process.env.NEXTCLOUD_BASEFOLDER + '/' + sender_name);

            if (target_folder == null) {

                log('processFile(' + jsonfile +'): target_folder not found');
                return;
            }

            const targetfile = pdffile.replace(process.env.FOLDER_IN, '');
            log('processFile(' + jsonfile +'): targetfile = ' + targetfile);

            const target: File = await target_folder.getFile(targetfile);
            log('processFile(' + jsonfile +'): target = ' + target);

            if (target != null) {

                log('processFile(' + jsonfile +'): WARN: target exists');
                return;
            }

            const pdffile_buffer: Buffer = fs.readFileSync(pdffile);
            const file: File = await target_folder.createFile(targetfile, pdffile_buffer);
            log('processFile(' + jsonfile +'): file created ');
 
            await file.addComment(JSON.stringify(jsondata, null, '  '));
            log('processFile(' + jsonfile +'): comment added');

            await file.addTag(process.env.NEXTCLOUD_SOURCE_TAG);
            log('processFile(' + jsonfile +'): tag added: ' + process.env.NEXTCLOUD_SOURCE_TAG);

            await file.addTag(sender_name);
            log('processFile(' + jsonfile +'): tag added: ' + sender_name);


            // Move processed files 
            
            fs.renameSync(jsonfile, jsonfile.replace(process.env.FOLDER_IN, process.env.FOLDER_PROCESSED) );
            log('processFile(' + jsonfile +'): moved jsonfile: ' + jsonfile.replace(process.env.FOLDER_IN, process.env.FOLDER_PROCESSED) );

            fs.renameSync(pdffile, pdffile.replace(process.env.FOLDER_IN, process.env.FOLDER_PROCESSED) );
            log('processFile(' + jsonfile +'): moved pdffile: ' + pdffile.replace(process.env.FOLDER_IN, process.env.FOLDER_PROCESSED) );

            log('processFile(' + jsonfile +'): SUCCESS');

        } catch (e) {
            log('processFile(' + jsonfile +'): ERROR: ' + e);
        }

        log('processFile(' + jsonfile +'): END');

    })();

}

function readFiles() {

    log('readFiles(): START');
    log('readFiles(): ' + process.env.FOLDER_IN + '*.json'); 

    glob(process.env.FOLDER_IN + '*.json', (err, files) => {  

        log('readFiles(): Found: ' + files.length);

        for (let i = 0; i < files.length; i++) {

            processFile(files[i]);
        }

     })

     log('readFiles(): END'); 
}  


log("Initial run ..");
readFiles();

log("Starting Cron, Schedule: " + process.env.CRON_SCHEDULE);
cron.schedule(process.env.CRON_SCHEDULE, readFiles);

log('END OF MAIN LOOP');
