Deno.bench(function bench() {
    let a = 0;
    for (let i = 0; i < 1000; i++) {
      a = a + i;
    }
  });
  
  
  Deno.bench(function bench() {
    Array.from({ length: 1000 }, (_, i) => i).reduce((a, b) => a + b, 0);
  });

