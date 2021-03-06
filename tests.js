$().ready(function () {
  test("[10] modulo seguro", function () {
    var serial_maker = function () {
      var seq = 0;
      return {
        set_seq:function (s) {
          seq = s;
        },
        gemsym:function () {
          var resultado = "[" + seq + "]";
          seq += 1;
          return resultado;
        }
      }
    }();

    serial_maker.set_seq(100);

    equal(serial_maker.gemsym(), "[100]");
    equal(serial_maker.gemsym(), "[101]");
    equal(serial_maker.gemsym(), "[102]");

    // o seq é interno, um segredo. Só dá pra ver debugando o serial_maker.gemsym();
    ok(_.isUndefined(serial_maker.seq), "_.isUndefined(serial_maker.seq)");
  });


  test("[20] memoizer + fibonacci", function () {

    var contaExecucoes = 0;

    /*
     * fibonacci SEM MEMÓRIA
     * executa demaziadas vezes a mesma função
     * ex: o 4 chama o 3 e o 2
     *       que chama o 3 chama o 2 e o 1
     *          que chama o 2 chama o 1 e o 0
     *       que chama o 2 chama o 1 e o 0
     *     o 3 chama o 2 e o 1
     *       que chama o 2 chama o 1 e o 0
     *     o 2 chama o 1 e o 0
     *     ...
     * */
    var fibonacci = function (n) {
      contaExecucoes += 1;
      return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
    };

    equal(fibonacci(10), 55);

    // 177 execuções
    ok(true, contaExecucoes + " execuções");
    contaExecucoes = 0;

    /*
     * fibonacci COM MEMÓRIA
     * */
    fibonacci = function () {
      var memo = [0, 1];
      var fib = function (n) {
        var result = memo[n];
        if (!_.isNumber(result)) {
          contaExecucoes += 1;
          result = fib(n - 1) + fib(n - 2);
          memo[n] = result;
        }
        return result;
      };
      return fib;
    }();

    equal(fibonacci(10), 55);

    // 9 execuções com cálculo, o resto da memória
    ok(true, contaExecucoes + " execuções");

    /*
     * memo: matriz inicial para guardar os valores ja calculados
     * shell: contêiner
     * fundamental: função original
     * */
    var memoizer = function (memo, fundamental) {
      var shell = function (n) {
        var result = memo[n];
        if (typeof result !== 'number') {
          result = fundamental(shell, n);
          memo[n] = result;
        }
        return result;
      };
      return shell;
    };


    fibonacci = memoizer([0, 1], function (shell, n) {
      return shell(n - 1) + shell(n - 2);
    });

    equal(fibonacci(10), 55);


    /*
     * memoizer aplicado ao fatorial
     * */
    var fatorial = memoizer([1, 1], function (shell, n) {
      return n * shell(n - 1);
    });

    equal(fatorial(2), 2);
    equal(fatorial(3), 6);
    equal(fatorial(4), 24);
  });

  test("[30] IoC no JS", function () {
    // define a module 'A'
    registerIoc('a', function () {
      return {
        print: function () {
          return '[A]';
        }
      };
    });

    // define a module 'B' that depends on module 'A'
    registerIoc('b', ['a'], function (a) {
      return {
        print: function () {
          var res = "(";
          res += a.print();
          return res + 'B)';
        }
      };
    });

    // define a module 'C' that depends on module 'A' and 'B'
    registerIoc('c', ['a', 'b'], function (a, b) {
      return {
        print: function () {
          var res = "{";
          res += a.print();
          res += b.print();
          return res + 'C}';
        }
      };
    });


    var a = resolve('a');
    equal(a.print(), "[A]");

    var b = resolve('b');
    equal(b.print(), "([A]B)");

    var c = resolve('c');
    equal(c.print(), "{[A]([A]B)C}");
  });
});


