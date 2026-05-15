import fs from 'fs/promises';
import path from 'path';

export class JsonTokenRepository {
  // Isso garante que ele use o caminho absoluto da raiz do projeto no Render
  private readonly filePath = path.join(process.cwd(), 'token.json');

  async save(tokenData: any): Promise<void> {
    const dataToSave = {
      ...tokenData,
      obtained_at: Date.now()
    };
    await fs.writeFile(this.filePath, JSON.stringify(dataToSave, null, 2));
    console.log("💾 Token salvo com sucesso!");
  }
}