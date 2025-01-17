# Gated group

How to create a gated group chat through an admin agent.

## Create the group

Send this message to the bot to kickstart the creation of the group.

```bash
/create
```

The bot will create a private group where you and the bot are the admins.Then will provide some information like:

```bash
Group created!
- ID: {groupId}
- Group Frame URL: https://converse.xyz/group/{groupId}:
- This url will deelink to the group inside Converse
- Once in the other group you can share the invite with your friends.
```

## Endpoint

Once you start the server on your port `3000` by default you can ping this endpoint with the parameters

```bash
curl -X POST http://localhost:3000/add-wallet \
 -H "Content-Type: application/json" \
 -d '{"walletAddress": "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204", "groupId": "769170b0fa5e4c757c38cc06ab145bc6"}'
```
