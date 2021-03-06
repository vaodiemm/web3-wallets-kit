import { AbstractConnector } from '@web3-wallets-kit/abstract-connector';
import { Provider, DefaultConnectionPayload } from '@web3-wallets-kit/types';

// TODO rewrite to Type-Only export with typescript@3.8
// https://github.com/microsoft/TypeScript/pull/35200
type BitskiSDKOptions = import('bitski').BitskiSDKOptions;
type BitskiClassType = import('bitski').Bitski;

export interface BitskiConnectionPayload extends DefaultConnectionPayload {
  bitski: BitskiClassType;
}

export interface BitskiConnectorConfig {
  clientId: string;
  redirectUri: string;
  additionalScopes?: string[];
  options?: BitskiSDKOptions;
}

export class BitskiConnector extends AbstractConnector<BitskiConnectionPayload> {
  constructor(private config: BitskiConnectorConfig) {
    super();
  }

  public async connect(): Promise<BitskiConnectionPayload> {
    const { clientId, redirectUri, additionalScopes, options } = this.config;

    const { Bitski } = await import('bitski');

    const bitski = new Bitski(clientId, redirectUri, additionalScopes, options);
    const provider = (bitski.getProvider() as unknown) as Provider;

    await bitski.signIn();

    this.payload = {
      provider,
      bitski,
    };

    return this.payload;
  }

  public async disconnect() {
    this.payload && (await this.payload.bitski.signOut());
    super.disconnect();
  }

  public async getAccount() {
    return (this.payload && (await this.payload.bitski.getUser()).accounts?.[0]) || null;
  }
}
