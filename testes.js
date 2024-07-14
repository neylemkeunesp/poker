// Função a ser testada (esta é uma implementação de exemplo)
function reconhecerCarta(cartaString) {
    const valores = '23456789TJQKA';
    const naipes = '♠♥♦♣';
    
    if (cartaString.length !== 2) {
        throw new Error('Formato de carta inválido');
    }
    
    const valor = cartaString[0].toUpperCase();
    const naipe = cartaString[1];
    
    if (!valores.includes(valor) || !naipes.includes(naipe)) {
        throw new Error('Carta inválida');
    }
    
    return {
        valor: valor,
        naipe: naipe,
        cor: (naipe === '♥' || naipe === '♦') ? 'vermelho' : 'preto'
    };
}

// Testes
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

    // Teste 1: Carta válida de espadas
    try {
        const resultado = reconhecerCarta('A♠');
        assert(resultado.valor === 'A' && resultado.naipe === '♠' && resultado.cor === 'preto',
               'Deve reconhecer corretamente o Ás de Espadas');
    } catch (e) {
        assert(false, 'Não deve lançar erro para uma carta válida');
    }

    // Teste 2: Carta válida de copas
    try {
        const resultado = reconhecerCarta('T♥');
        assert(resultado.valor === 'T' && resultado.naipe === '♥' && resultado.cor === 'vermelho',
               'Deve reconhecer corretamente o 10 de Copas');
    } catch (e) {
        assert(false, 'Não deve lançar erro para uma carta válida');
    }

    // Teste 3: Carta inválida
    try {
        reconhecerCarta('H1');
        assert(false, 'Deve lançar erro para uma carta inválida');
    } catch (e) {
        assert(true, 'Lança erro corretamente para carta inválida');
    }

    // Teste 4: String vazia
    try {
        reconhecerCarta('');
        assert(false, 'Deve lançar erro para uma string vazia');
    } catch (e) {
        assert(true, 'Lança erro corretamente para string vazia');
    }

    // Teste 5: Carta com valor minúsculo
    try {
        const resultado = reconhecerCarta('k♦');
        assert(resultado.valor === 'K' && resultado.naipe === '♦' && resultado.cor === 'vermelho',
               'Deve reconhecer corretamente o Rei de Ouros com letra minúscula');
    } catch (e) {
        assert(false, 'Não deve lançar erro para uma carta válida com letra minúscula');
    }

    console.log(`\nTestes concluídos: ${testesPassados}/${testesTotais} passaram.`);
}

// Executar os testes
executarTestes();
