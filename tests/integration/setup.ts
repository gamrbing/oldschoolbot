import './mocks';
import '../globalSetup';

import { Image } from '@napi-rs/canvas';
import { noOp } from 'e';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

import { BankImageTask, bankImageTask } from '../../src/lib/bankImage';

export function randomMock(random = 0.1) {
	Math.random = () => random;
}

vi.mock('../../src/lib/util/webhook', async () => {
	const actual: any = await vi.importActual('../../src/lib/util/webhook');
	return {
		...actual,
		sendToChannelID: vi.fn()
	};
});

vi.mock('../../src/lib/gear/functions/generateGearImage', async () => {
	const actual: any = await vi.importActual('../../src/lib/gear/functions/generateGearImage');
	return {
		...actual,
		generateGearImage: vi.fn().mockReturnValue(Promise.resolve(Buffer.from('')))
	};
});

vi.mock('../../src/lib/leagues/stats', async () => {
	const actual: any = await vi.importActual('../../src/lib/leagues/stats');
	return {
		...actual,
		calcLeaguesRanking: async () => ({
			pointsRanking: 1,
			tasksRanking: 1
		})
	};
});
vi.mock('../../src/lib/util/chart', async () => {
	const actual: any = await vi.importActual('../../src/lib/gear/functions/generateGearImage');
	return {
		...actual,
		createChart: vi.fn().mockReturnValue(Promise.resolve(Buffer.from('')))
	};
});

// @ts-ignore mock
globalClient.fetchUser = async (id: string | bigint) => ({
	id: typeof id === 'string' ? id : String(id),
	send: async () => {}
});

const mockBankImageTask = {
	init: vi.fn(),
	run: vi.fn(),
	generateBankImage: vi.fn().mockReturnValue(Promise.resolve({ image: Buffer.from(''), isTransparent: false })),
	getItemImage: vi.fn().mockReturnValue(Promise.resolve(new Image())),
	fetchAndCacheImage: vi.fn().mockReturnValue(Promise.resolve(new Image())),
	backgroundImages: []
};
bankImageTask.fetchAndCacheImage = mockBankImageTask.fetchAndCacheImage;
global.bankImageGenerator = mockBankImageTask as any;
BankImageTask.prototype.init = mockBankImageTask.init;
BankImageTask.prototype.run = mockBankImageTask.init;
BankImageTask.prototype.generateBankImage = mockBankImageTask.generateBankImage;
BankImageTask.prototype.getItemImage = mockBankImageTask.getItemImage;
BankImageTask.prototype.fetchAndCacheImage = mockBankImageTask.fetchAndCacheImage;

beforeAll(async () => {
	await prisma.$connect();
	await prisma.$queryRaw`CREATE EXTENSION IF NOT EXISTS intarray;`.catch(noOp);
});

beforeEach(async () => {
	global.bankImageGenerator = mockBankImageTask as any;
	BankImageTask.prototype.init = mockBankImageTask.init;
	BankImageTask.prototype.run = mockBankImageTask.init;
	BankImageTask.prototype.generateBankImage = mockBankImageTask.generateBankImage;
	BankImageTask.prototype.getItemImage = mockBankImageTask.getItemImage;
	BankImageTask.prototype.fetchAndCacheImage = mockBankImageTask.fetchAndCacheImage;
});

afterAll(async () => {
	await prisma.$disconnect();
});
