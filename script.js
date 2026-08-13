// ===============================
// LÓGICA DE IMPORTAÇÃO E LEITURA DE PDF GERADO
// ===============================
const btnCarregarPdf = document.getElementById("btnCarregarPdf");
const pdfFileInput = document.getElementById("pdfFileInput");

if (btnCarregarPdf && pdfFileInput) {
  btnCarregarPdf.addEventListener("click", () => {
    pdfFileInput.click();
  });

  pdfFileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      if (fields.length === 0) {
        alert("Nenhum campo editável foi encontrado no PDF selecionado.");
        return;
      }

      // Preenche os campos do formulário HTML com os dados extraídos do PDF
      fields.forEach(field => {
        const name = field.getName();
        let value = "";

        try {
          if (field instanceof PDFLib.PDFTextField) {
            value = field.getText() || "";
          } else if (field instanceof PDFLib.PDFDropdown) {
            const selected = field.getSelected();
            value = selected.length > 0 ? selected[0] : "";
          } else if (field instanceof PDFLib.PDFCheckBox) {
            value = field.isChecked() ? "on" : "";
          } else if (field instanceof PDFLib.PDFRadioGroup) {
            value = field.getSelected() || "";
          }
        } catch (err) {
          console.warn(`Erro ao ler valor do campo ${name}:`, err);
        }

        // Procura os inputs/selects correspondentes na página
        const htmlFields = Array.from(formEl.querySelectorAll(`[name="${name}"]`));
        htmlFields.forEach(htmlField => {
          if (htmlField.type === "checkbox" || htmlField.type === "radio") {
            htmlField.checked = (htmlField.value === value || value === "on");
          } else {
            htmlField.value = value;
          }
        });
      });

      // Atualiza o progresso e persiste no localStorage
      saveFormData();
      updateProgress();
      alert("Dados do PDF importados com sucesso! Você pode editá-los e gerar um novo PDF.");

    } catch (err) {
      console.error("Erro ao carregar o arquivo PDF:", err);
      alert("Não foi possível ler os dados deste arquivo PDF. Certifique-se de que é um PDF válido gerado pelo sistema.");
    } finally {
      pdfFileInput.value = ""; // Limpa a seleção para permitir recarregar o mesmo arquivo se preciso
    }
  });
}