import * as fs from 'fs';

const getWebhooks = (): any => {
	const webhooks_file = fs.readFileSync('config/webhooks.json', 'utf-8');
	const webhooks_obj = JSON.parse(webhooks_file);
	return webhooks_obj;
	// const webhooks_keys = Object.keys(webhooks_obj).filter(k => webhooks_obj[k]);
	// return webhooks_keys;
}

export { getWebhooks }