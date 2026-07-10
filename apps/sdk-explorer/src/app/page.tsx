'use client';

import { ActionDispatcher, DataDispatcher, UrlDispatcher } from '@/components/Dispatchers';
import Layout from '@/components/Layout';

export default function Home() {
  const sampleObject = { name: 'John D. Doe', names: ['John', 'D', 'Doe'] };
  return (
    <Layout title="sample results">
      <div>api route</div>
      <div>
        <UrlDispatcher label="/api/hello" url="/api/hello" />
      </div>
      <hr />
      <div>url</div>
      <div>
        <UrlDispatcher label="/feriados" url="https://brasilapi.com.br/api/feriados/v1/2023" />
      </div>
      <hr />
      <div>action</div>
      <div>
        <ActionDispatcher label="Date.now()" onAction={() => Date.now()} />
      </div>
      <hr />
      <div>data</div>
      <div>
        <DataDispatcher label="int" data={123456} />
        <DataDispatcher label="float" data={123.456} />
        <DataDispatcher label="BigInt" data={12345678901234567890n} />
        <DataDispatcher label="string" data={'Hello World!'} />
        <DataDispatcher label="object" data={sampleObject} />
        <DataDispatcher label="array" data={sampleObject.names} />
      </div>
    </Layout>
  );
}
