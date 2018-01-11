require('dotenv').config()

steem = require('steem');
Twilio = require('twilio');

// Steem connection and witness information
node    = process.env.STEEM_NODE;
witness = process.env.STEEM_ACCOUNT;
wif     = process.env.STEEM_WIF;

// Establish the connection to steem
steem.api.setOptions({url: node});

// How many misses before we trigger the update, 0 for debugging (always trigger)
threshold = Number(process.env.THRESHOLD)

// How often should we check for misses? (in seconds)
check_rate = Number(process.env.CHECK_RATE)

// The signing key to swap to when the threshold is met
backup_key = process.env.STEEM_BACKUP

// Properties to set on the witness update
props = {
    "account_creation_fee": process.env.STEEM_ACCOUNT_CREATION_FEE,
    "maximum_block_size": Number(process.env.STEEM_MAXIMUM_BLOCK_SIZE),
    "sbd_interest_rate": Number(process.env.STEEM_SBD_INTEREST_RATE),
}
witness_url = process.env.STEEM_WITNESS_URL;

// SMS via Twilio (Paid Service)
accountSid = process.env.TWILIO_ACCOUNT_SID;
token = process.env.TWILIO_ACCOUNT_TOKEN;
twilio = new Twilio(accountSid, token);
twilio_send_to = process.env.TWILIO_SEND_TO;
twilio_send_from = process.env.TWILIO_SEND_FROM;
twilio_send_message = "witness failover triggered"

// Send Twilio SMS
function sendSmsAlert() {
	twilio.messages.create({
	  from: twilio_send_from,
	  to: twilio_send_to,
	  body: twilio_send_message
	}, function(err, result) {
		console.log(`[${new Date().getTime()}] Sent SMS Alert.. Result: ${result.sid}`);
	});
}

// Get wtness current missed blocks
function getTotalMissed(cb) {
	steem.api.getWitnessByAccountAsync(witness).then((res) => {cb(res.total_missed)});
}

// Run the process
function run() {
	getTotalMissed(function(current_missed){
		if (current_missed > threshold) {
			console.log(`[${new Date().getTime()}] ALERT: Activating backup witness .. Total missed: ${current_missed}`);
			// Send SMS Alert before attempting to update so you will catch any error following
			sendSmsAlert();
			// Activate the backup witness then exit
			steem.broadcast.witnessUpdate(wif, witness, witness_url, backup_key, props, '0.000 STEEM', function(err, result) {
				console.log(`[${new Date().getTime()}] SUCCESS: Backup witness activated .. Total missed: ${current_missed}`);
				process.exit();
			});
		} else {
			// Do nothing -- Total missed below threshold
			console.log(`[${new Date().getTime()}] All clear .. Total missed: ${current_missed}`);
		}
	});
}

run();
setInterval(function(){run()}, check_rate*1000);
