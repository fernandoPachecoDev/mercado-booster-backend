import fs from 'fs/promises';
import path from 'path';

export class JsonTokenRepository {
  private readonly filePath = path.resolve('token.json');

  async save(tokenData: any): Promise<void> {
    // Adicionamos um timestamp para saber quando expira (Meli expira em 6h)
    const dataToSave = {
      ...tokenData,
      obtained_at: Date.now()
    };
    await fs.writeFile(this.filePath, JSON.stringify(dataToSave, null, 2));
    console.log("💾 Token salvo com sucesso em token.json!");
  }
}