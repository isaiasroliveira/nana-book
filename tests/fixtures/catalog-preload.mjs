const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.hostname !== 'www.googleapis.com') return originalFetch(input, init);
  const id = url.pathname.split('/').at(-1);
  if (id === 'volumes') return Promise.resolve(Response.json({items:[{id:'volume-live',volumeInfo:{title:'Livro para avaliação',authors:['Autora de teste']}}]}));
  if (id === 'unavailable') return Promise.resolve(new Response(null, {status:503}));
  if (id === 'missing') return Promise.resolve(new Response(null, {status:404}));
  return Promise.resolve(Response.json({id, volumeInfo:{title:`Livro ${id}`, authors:['Autora de teste']}}));
};
