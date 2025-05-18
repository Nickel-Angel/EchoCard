import { invoke } from "@tauri-apps/api/core";

/**
 * 获取当前的FSRS模型参数
 *
 * @returns 返回当前的FSRS参数数组
 */
export async function getFsrsParams(): Promise<number[]> {
  try {
    const params = await invoke<number[]>("get_fsrs_params");
    return params;
  } catch (error) {
    console.error("获取FSRS参数失败:", error);
    throw error;
  }
}

/**
 * 训练FSRS模型参数
 *
 * @returns 返回优化后的FSRS参数数组
 */
export async function trainFsrsModel(): Promise<number[]> {
  try {
    const optimizedParams = await invoke<number[]>("train_fsrs_model");
    return optimizedParams;
  } catch (error) {
    console.error("训练FSRS模型失败:", error);
    throw error;
  }
}

/**
 * 获取当前的记忆留存率
 *
 * @returns 返回当前的记忆留存率（0.6-1.0之间的浮点数）
 */
export async function getDesiredRetention(): Promise<number> {
  try {
    const retention = await invoke<number>("get_desired_retention");
    return retention;
  } catch (error) {
    console.error("获取记忆留存率失败:", error);
    throw error;
  }
}

/**
 * 设置记忆留存率
 *
 * @param retention 新的记忆留存率值（0.6-1.0之间的浮点数）
 */
export async function setDesiredRetention(retention: number): Promise<void> {
  try {
    if (retention < 0.6 || retention > 1.0) {
      throw new Error("记忆留存率必须在0.6到1.0之间");
    }
    await invoke("set_desired_retention", { retention });
  } catch (error) {
    console.error("设置记忆留存率失败:", error);
    throw error;
  }
}
