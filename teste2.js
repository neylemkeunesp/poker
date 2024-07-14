// Função para reconhecer o tipo de jogo
function reconhecerTipoJogo(cartas) {
    // Ordenar as cartas por valor
    cartas.sort((a, b) => "23456789TJQKA".indexOf(a[0]) - "23456789TJQKA".indexOf(b[0]));

    const valores = cartas.map(carta => carta[0]);
    const naipes = cartas.map(carta => carta[1]);

    // Verificar Royal Flush
    if (valores.join('') === 'TJQKA' && new Set(naipes).size === 1) {
        return 'Royal Flush';
    }

    // Verificar Straight Flush
    if (new Set(naipes).size === 1 && "A23456789TJQKA".includes(valores.join(''))) {
        return 'Straight Flush';
    }

    // Verificar Four of a Kind
    if (new Set(valores).size === 2 && (valores[0] === valores[3] || valores[1] === valores[4])) {
        return 'Four of a Kind';
    }

    // Verificar Full House
    if (new Set(valores).size === 2) {
        return 'Full House';
    }

    // Verificar Flush
    if (new Set(naipes).size === 1) {
        return 'Flush';
    }

    // Verificar Straight
    if ("A23456789TJQKA".includes(valores.join(''))) {
        return 'Straight';
    }

    // Verificar Three of a Kind
    if (new Set(valores).size === 3 && (valores[0] === valores[2] || valores[1] === valores[3] || valores[2] === valores[4])) {
        return 'Three of a Kind';
    }

    // Verificar Two Pair
    if (new Set(valores).size === 3) {
        return 'Two Pair';
    }

    // Verificar One Pair
    if (new Set(valores).size === 4) {
        return 'One Pair';
    }

    // Se nenhuma das condições acima for atendida, é High Card
    return 'High Card';
}

// Função de testes
function executarTestes() {
    let testesPassados = 0;
    let testesTotais = 0;

    function assert(condicao, mensagem) {
        testesTotais++;
        if (condicao) {
            testesPassados++;
            console.log(`✅ Teste passou: ${mensagem}`);
        } else {
            console.error(`❌ Teste falhou: ${mensagem}`);
        }
    }

    // Teste 1: Royal Flush
    assert(reconhecerTipoJogo(['T♠', 'J♠', 'Q♠', 'K♠', 'A♠']) === 'Royal Flush', 'Deve reconhecer Royal Flush');

    // Teste 2: Straight Flush
    assert(reconhecerTipoJogo(['7♥', '8♥', '9♥', 'T♥', 'J♥']) === 'Straight Flush', 'Deve reconhecer Straight Flush');

    // Teste 3: Four of a Kind
    assert(reconhecerTipoJogo(['A♠', 'A♥', 'A♦', 'A♣', 'K♠']) === 'Four of a Kind', 'Deve reconhecer Four of a Kind');

    // Teste 4: Full House
    assert(reconhecerTipoJogo(['J♠', 'J♥', 'J♦', 'Q♣', 'Q♠']) === 'Full House', 'Deve reconhecer Full House');

    // Teste 5: Flush
    assert(reconhecerTipoJogo(['2♦', '5♦', '7♦', 'J♦', 'K♦']) === 'Flush', 'Deve reconhecer Flush');

    // Teste 6: Straight
    assert(reconhecerTipoJogo(['9♠', 'T♥', 'J♦', 'Q♣', 'K♠']) === 'Straight', 'Deve reconhecer Straight');

    // Teste 7: Three of a Kind
    assert(reconhecerTipoJogo(['7♠', '7♥', '7♦', 'A♣', 'K♠']) === 'Three of a Kind', 'Deve reconhecer Three of a Kind');

    // Teste 8: Two Pair
    assert(reconhecerTipoJogo(['5♠', '5♥', '9♦', '9♣', 'A♠']) === 'Two Pair', 'Deve reconhecer Two Pair');

    // Teste 9: One Pair
    assert(reconhecerTipoJogo(['T♠', 'T♥', '8♦', '5♣', 'K♠']) === 'One Pair', 'Deve reconhecer One Pair');

    // Teste 10: High Card
    assert(reconhecerTipoJogo(['2♠', '7♥', 'J♦', 'Q♣', 'A♠']) === 'High Card', 'Deve reconhecer High Card');

    console.log(`\nTestes concluídos: ${testesPassados}/${testesTotais} passaram.`);
}

// Executar os testes
executarTestes();
