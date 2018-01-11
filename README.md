## Utopian Witness Failover Script

Single use automatic failover for steem witness nodes with a Twilio SMS notification

Requirements:

- Docker
- Your WIF Active Key
- Twilio Account (or disable that code yourself)

To get started, there are two steps

```
cp .env.example .env
```

Then edit the values in the `.env` file to the appropriate values for your account.

- **STEEM_ACCOUNT**: The account name of the witness
- **STEEM_NODE**: The steem public node used to broadcast the transaction
- **STEEM_WIF**: The WIF active **PRIVATE** key of the account
- **STEEM_BACKUP**: The WIF signing **PUBLIC** key of the backup server
- **STEEM_ACCOUNT_CREATION_FEE**: (Preferred Witness Setting)
- **STEEM_MAXIMUM_BLOCK_SIZE**: (Preferred Witness Setting)
- **STEEM_SBD_INTEREST_RATE**: (Preferred Witness Setting)
- **STEEM_WITNESS_URL**: (Preferred Witness Setting)
- **CHECK_RATE**: The number of seconds between checks.

The most confusing setting is likely:

- **THRESHOLD**: When the specified account reaches this value as `total_missed`, the update will execute and change the witness account's signing key to the key specified as `steem_backup`.

Once these environmental variables are configured, you can build and start the script with:

```
docker-compose up --build -d --remove-orphans
```

The container will be running in the background doing its job.
You can check the logs by running:

```
docker-compose logs -f
```

You will begin to see messages in your terminal similar to:

```
[1515633922] All clear .. Total missed: 0
[1515633982] All clear .. Total missed: 0
[1515634042] All clear .. Total missed: 0
```

That means it's working properly, and will trigger once the failover amount is reached.

```
[1515633982] All clear .. Total missed: 1
[1515634042] All clear .. Total missed: 2
[1515634102] ALERT: Activating backup witness .. Total missed: 3
```

That means the backup witness has been activated. The script has terminated.
