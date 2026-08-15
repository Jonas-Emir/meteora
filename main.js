document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrinho();
    inicializarModalDetalhes();
    inicializarNewsletter();
    inicializarLojasFavoritas();
    inicializarNovidadesLikes();
    inicializarPromocoesDesconto();
});

function inicializarCarrinho() {
    atualizarContadorCarrinho();
    
    const btnAddCarrinho = document.querySelector('#modalProduto .btn-add-carrinho');
    if (btnAddCarrinho) {
        btnAddCarrinho.addEventListener('click', () => {
            const nome = document.getElementById('modalNome').textContent;
            const precoTexto = document.getElementById('modalPreco').textContent;
            const preco = parseFloat(precoTexto.replace('R$', '').replace(',', '.').trim());
            const img = document.getElementById('modalImg').src;
            
            const tamanhoAtivo = document.querySelector('input[name="btn-tamanho"]:checked');
            const tamanho = tamanhoAtivo ? tamanhoAtivo.nextElementSibling.textContent : 'M';
            
            const corAtiva = document.querySelector('input[name="btn-cor"]:checked');
            const cor = corAtiva ? corAtiva.nextElementSibling.textContent : 'Padrão';

            const item = {
                id: `${nome}-${tamanho}-${cor}`,
                nome,
                preco,
                img,
                tamanho,
                cor,
                quantidade: 1
            };

            adicionarItemAoCarrinho(item);
            
            const modalElement = document.getElementById('modalProduto');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        });
    }

    const modalCarrinhoElement = document.getElementById('modalCarrinho');
    if (modalCarrinhoElement) {
        modalCarrinhoElement.addEventListener('show.bs.modal', renderizarCarrinho);
    }
}

function obterCarrinho() {
    const carrinho = sessionStorage.getItem('carrinho');
    return carrinho ? JSON.parse(carrinho) : [];
}

function salvarCarrinho(carrinho) {
    sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
}

function adicionarItemAoCarrinho(novoItem) {
    const carrinho = obterCarrinho();
    const itemExistente = carrinho.find(item => item.id === novoItem.id);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push(novoItem);
    }

    salvarCarrinho(carrinho);
    exibirAlertaSucesso(`Produto "${novoItem.nome}" adicionado ao carrinho!`);
}

function removerItemDoCarrinho(id) {
    let carrinho = obterCarrinho();
    carrinho = carrinho.filter(item => item.id !== id);
    salvarCarrinho(carrinho);
    renderizarCarrinho();
}

function alterarQuantidadeItem(id, operacao) {
    const carrinho = obterCarrinho();
    const item = carrinho.find(item => item.id === id);

    if (item) {
        if (operacao === 'aumentar') {
            item.quantidade += 1;
        } else if (operacao === 'diminuir' && item.quantidade > 1) {
            item.quantidade -= 1;
        }
        salvarCarrinho(carrinho);
        renderizarCarrinho();
    }
}

function atualizarContadorCarrinho() {
    const carrinho = obterCarrinho();
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    const badge = document.querySelector('.cart-count');
    if (badge) {
        badge.textContent = totalItens;
        badge.style.display = totalItens > 0 ? 'inline-block' : 'none';
    }
}

function renderizarCarrinho() {
    const container = document.getElementById('carrinhoItens');
    const totalContainer = document.getElementById('carrinhoTotal');
    if (!container || !totalContainer) return;

    const carrinho = obterCarrinho();
    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = '<div class="text-center py-4 text-secondary"><i class="bi bi-cart3 fs-1 d-block mb-2"></i>Seu carrinho está vazio.</div>';
        totalContainer.textContent = 'R$ 0,00';
        return;
    }

    let totalGeral = 0;

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        totalGeral += subtotal;

        const itemHtml = `
            <div class="row align-items-center mb-3 pb-3 border-bottom g-2">
                <div class="col-3 col-sm-2">
                    <img src="${item.img}" class="img-fluid border" alt="${item.nome}">
                </div>
                <div class="col-9 col-sm-5">
                    <h6 class="fw-bold mb-1">${item.nome}</h6>
                    <p class="text-secondary mb-0 small">Tamanho: ${item.tamanho} | Cor: ${item.cor}</p>
                    <p class="fw-bold text-primary mb-0 small">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                </div>
                <div class="col-6 col-sm-3 d-flex align-items-center justify-content-start justify-content-sm-center">
                    <button class="btn btn-outline-secondary btn-sm px-2 py-0 rounded-0" onclick="alterarQuantidadeItem('${item.id}', 'diminuir')">-</button>
                    <span class="mx-2 fw-bold small">${item.quantidade}</span>
                    <button class="btn btn-outline-secondary btn-sm px-2 py-0 rounded-0" onclick="alterarQuantidadeItem('${item.id}', 'aumentar')">+</button>
                </div>
                <div class="col-6 col-sm-2 text-end d-flex flex-column justify-content-between align-items-end">
                    <span class="fw-bold text-dark small">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                    <button class="btn text-danger btn-sm p-0 border-0 bg-transparent mt-1" onclick="removerItemDoCarrinho('${item.id}')">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    });

    totalContainer.textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}

function inicializarModalDetalhes() {
    const modalElement = document.getElementById('modalProduto');
    if (!modalElement) return;

    const modal = new bootstrap.Modal(modalElement);
    const modalImg = document.getElementById('modalImg');
    const modalNome = document.getElementById('modalNome');
    const modalPreco = document.getElementById('modalPreco');
    const modalDescricao = document.getElementById('modalDescricao');

    document.querySelectorAll('.btn-ver-mais').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const nome = button.getAttribute('data-nome');
            let preco = button.getAttribute('data-preco');
            const descricao = button.getAttribute('data-descricao');
            const img = button.getAttribute('data-img');

            const cardBody = button.closest('.card-body');
            if (cardBody) {
                const precoAtualEl = cardBody.querySelector('.preco-atual');
                if (precoAtualEl) {
                    preco = precoAtualEl.textContent.split('+10%')[0].trim();
                } else {
                    const pPreco = cardBody.querySelector('p.fw-bold');
                    if (pPreco) {
                        preco = pPreco.textContent;
                    }
                }
            }

            modalNome.textContent = nome;
            modalPreco.textContent = preco;
            modalDescricao.textContent = descricao;
            modalImg.src = img;
            modalImg.alt = `Imagem de ${nome}`;

            const radioP = document.getElementById('btn-p');
            if (radioP) radioP.checked = true;
            const radioCor1 = document.getElementById('btn-cor1');
            if (radioCor1) radioCor1.checked = true;

            modal.show();
        });
    });
}

function inicializarNewsletter() {
    const formNewsletter = document.querySelector('.div-novidades');
    if (!formNewsletter) return;

    if (sessionStorage.getItem('newsletter_signed') === 'true') {
        customizarNewsletterSucesso(formNewsletter);
    }

    formNewsletter.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = formNewsletter.querySelector('input[type="email"]');
        if (input && input.value.trim() !== '') {
            sessionStorage.setItem('newsletter_signed', 'true');
            exibirAlertaSucesso("Inscrição realizada com sucesso! Use o cupom METEORA10 para ganhar 10% OFF em Promoções.");
            customizarNewsletterSucesso(formNewsletter);
            
            if (typeof recalcularDescontosPromocao === 'function') {
                recalcularDescontosPromocao();
            }
        }
    });

    const btnNewsletter = document.getElementById('button-addon2');
    if (btnNewsletter && !formNewsletter.dataset.listenerSet) {
        btnNewsletter.addEventListener('click', () => {
            const input = btnNewsletter.previousElementSibling;
            if (input && input.value.trim() !== '') {
                sessionStorage.setItem('newsletter_signed', 'true');
                exibirAlertaSucesso("Inscrição realizada com sucesso! Use o cupom METEORA10 para ganhar 10% OFF em Promoções.");
                if (formNewsletter) customizarNewsletterSucesso(formNewsletter);
                
                if (typeof recalcularDescontosPromocao === 'function') {
                    recalcularDescontosPromocao();
                }
            }
        });
        formNewsletter.dataset.listenerSet = "true";
    }
}

function customizarNewsletterSucesso(container) {
    container.innerHTML = `
        <div class="py-2">
            <i class="bi bi-patch-check-fill text-success fs-1 mb-2"></i>
            <h5 class="fw-bold">Você já está cadastrado!</h5>
            <p class="mb-0 text-secondary">Aproveite seu cupom de desconto de 10% OFF: <strong class="text-dark bg-light px-2 py-1 border border-secondary border-dashed">METEORA10</strong></p>
        </div>
    `;
}

function inicializarLojasFavoritas() {
    const favoritarBtns = document.querySelectorAll('.btn-favoritar-loja');
    if (favoritarBtns.length === 0) return;

    const lojaFavoritaId = sessionStorage.getItem('loja_favorita');
    if (lojaFavoritaId) {
        destacarLojaFavorita(lojaFavoritaId);
    }

    favoritarBtns.forEach(button => {
        button.addEventListener('click', () => {
            const lojaId = button.getAttribute('data-loja-id');
            sessionStorage.setItem('loja_favorita', lojaId);
            destacarLojaFavorita(lojaId);
            exibirAlertaSucesso("Loja selecionada como favorita!");
        });
    });
}

function destacarLojaFavorita(lojaId) {
    document.querySelectorAll('.loja-card-wrapper').forEach(wrapper => {
        const card = wrapper.querySelector('.card');
        const btn = wrapper.querySelector('.btn-favoritar-loja');
        const badge = wrapper.querySelector('.loja-favorita-badge');
        const cardLojaId = btn.getAttribute('data-loja-id');

        if (cardLojaId === lojaId) {
            card.classList.add('border-primary', 'shadow-lg');
            card.style.borderWidth = '2px';
            btn.classList.replace('btn-outline-dark', 'btn-success');
            btn.innerHTML = '<i class="bi bi-heart-fill me-1"></i> Favoritada';
            if (badge) badge.classList.remove('d-none');
        } else {
            card.classList.remove('border-primary', 'shadow-lg');
            card.style.borderWidth = '1px';
            btn.classList.replace('btn-success', 'btn-outline-dark');
            btn.innerHTML = 'Marcar como Favorita';
            if (badge) badge.classList.add('d-none');
        }
    });
}

function inicializarNovidadesLikes() {
    const likeBtns = document.querySelectorAll('.btn-like-novidade');
    if (likeBtns.length === 0) return;

    let curtidas = obterNovidadesCurtidas();

    likeBtns.forEach(btn => {
        const id = btn.getAttribute('data-produto-id');
        const icon = btn.querySelector('i');
        
        if (curtidas.includes(id)) {
            icon.className = 'bi bi-heart-fill text-danger';
        } else {
            icon.className = 'bi bi-heart';
        }

        btn.addEventListener('click', () => {
            curtidas = obterNovidadesCurtidas();
            const index = curtidas.indexOf(id);

            if (index > -1) {
                curtidas.splice(index, 1);
                icon.className = 'bi bi-heart';
                exibirAlertaSucesso("Item removido dos seus curtidos.");
            } else {
                curtidas.push(id);
                icon.className = 'bi bi-heart-fill text-danger';
                exibirAlertaSucesso("Item curtido e adicionado à sua sessão!");
            }

            sessionStorage.setItem('liked_novidades', JSON.stringify(curtidas));
        });
    });
}

function obterNovidadesCurtidas() {
    const curtidas = sessionStorage.getItem('liked_novidades');
    return curtidas ? JSON.parse(curtidas) : [];
}

function inicializarPromocoesDesconto() {
    const formCupom = document.getElementById('formCupom');
    if (!formCupom && !document.getElementById('preco-base-promocao')) return;

    recalcularDescontosPromocao();

    if (formCupom) {
        formCupom.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('inputCupom');
            if (input && input.value.trim().toUpperCase() === 'METEORA10') {
                sessionStorage.setItem('cupom_ativo', 'true');
                exibirAlertaSucesso("Cupom METEORA10 aplicado! 10% de desconto extra concedido!");
                recalcularDescontosPromocao();
            } else {
                exibirAlertaErro("Cupom inválido. Tente 'METEORA10'.");
            }
        });
    }
}

function recalcularDescontosPromocao() {
    const cupomAplicado = sessionStorage.getItem('cupom_ativo') === 'true';
    const newsletterInscrito = sessionStorage.getItem('newsletter_signed') === 'true';
    const temDesconto = cupomAplicado || newsletterInscrito;

    const bannerStatus = document.getElementById('bannerCupomStatus');
    const inputCupom = document.getElementById('inputCupom');
    const btnCupom = document.getElementById('btnAplicarCupom');

    if (temDesconto) {
        if (bannerStatus) {
            bannerStatus.innerHTML = `
                <div class="alert alert-success d-flex align-items-center justify-content-between mb-0 rounded-0" role="alert">
                    <div>
                        <i class="bi bi-patch-check-fill me-2"></i>
                        <strong>Cupom de 10% OFF ativado!</strong> Desconto extra aplicado a todos os itens.
                    </div>
                    <button class="btn btn-sm btn-outline-success rounded-0" onclick="removerCupom()">Remover Cupom</button>
                </div>
            `;
        }
        if (inputCupom) {
            inputCupom.value = 'METEORA10';
            inputCupom.disabled = true;
        }
        if (btnCupom) btnCupom.disabled = true;
    } else {
        if (bannerStatus) {
            bannerStatus.innerHTML = `
                <div class="alert alert-warning mb-0 rounded-0" role="alert">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    Cadastre-se na newsletter ou use o cupom <strong>METEORA10</strong> para ganhar 10% OFF extra!
                </div>
            `;
        }
        if (inputCupom) {
            inputCupom.value = '';
            inputCupom.disabled = false;
        }
        if (btnCupom) btnCupom.disabled = false;
    }

    document.querySelectorAll('.preco-container').forEach(container => {
        const precoOriginal = parseFloat(container.getAttribute('data-preco-original'));
        const precoPromo = parseFloat(container.getAttribute('data-preco-promo'));
        
        const elementoPrecoNormal = container.querySelector('.preco-atual');

        if (temDesconto) {
            const precoFinal = precoPromo * 0.9;
            elementoPrecoNormal.innerHTML = `R$ ${precoFinal.toFixed(2).replace('.', ',')} <span class="badge bg-success ms-2 small" style="font-size: 0.7rem;">+10% OFF</span>`;
        } else {
            elementoPrecoNormal.textContent = `R$ ${precoPromo.toFixed(2).replace('.', ',')}`;
        }
    });
}

window.removerCupom = function() {
    sessionStorage.removeItem('cupom_ativo');
    sessionStorage.removeItem('newsletter_signed');
    exibirAlertaSucesso("Desconto extra removido.");
    recalcularDescontosPromocao();
    
    const formNewsletter = document.querySelector('.div-novidades');
    if (formNewsletter) {
        window.location.reload();
    }
};

function exibirAlertaSucesso(mensagem) {
    exibirNotificacaoToast(mensagem, 'success');
}

function exibirAlertaErro(mensagem) {
    exibirNotificacaoToast(mensagem, 'danger');
}

function exibirNotificacaoToast(mensagem, tipo = 'success') {
    const antigo = document.getElementById('toastNotification');
    if (antigo) antigo.remove();

    const toastHtml = `
        <div id="toastNotification" class="toast align-items-center text-bg-${tipo} border-0 position-fixed bottom-0 end-0 m-3 rounded-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true" style="z-index: 9999;">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i> ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById('toastNotification');
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
}
