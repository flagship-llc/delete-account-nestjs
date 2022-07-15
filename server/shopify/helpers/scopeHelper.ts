import * as fs from 'fs';

const getScopes = (): string => {
	const scopes_file = fs.readFileSync('config/app-scopes.json', 'utf-8');
	const scopes_obj = JSON.parse(scopes_file);
	const scopes = Object.keys(scopes_obj).filter(k => scopes_obj[k]).join(',');
	return scopes;
}

export { getScopes }